#!/usr/bin/env python3
"""Read-only SoundCloud catalog sync and Songstats match report. Python 3.10+."""
from __future__ import annotations
import argparse
import base64
import csv
import hashlib
import http.server
import json
import os
from pathlib import Path
import re
import secrets
import sys
import time
from urllib.parse import urlencode, urlparse, parse_qs
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

AUTH_HOST = "https://secure.soundcloud.com"
API_HOST = "https://api.soundcloud.com"
DEFAULT_REDIRECT = "http://127.0.0.1:8765/callback"

def normalize(value: str) -> str:
    import unicodedata
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", text.casefold())

def request_json(url: str, token: str | None = None, method="GET", form=None):
    if not (url.startswith(API_HOST + "/") or url.startswith(AUTH_HOST + "/")):
        raise ValueError("Refusing API URL outside SoundCloud hosts")
    headers = {"Accept": "application/json; charset=utf-8", "User-Agent": "NRN-catalog-sync/0.1"}
    if token:
        headers["Authorization"] = "OAuth " + token
    payload = None
    if form is not None:
        payload = urlencode(form).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    for attempt in range(4):
        try:
            with urlopen(Request(url, data=payload, headers=headers, method=method), timeout=30) as response:
                return json.load(response)
        except HTTPError as exc:
            if exc.code not in (429, 500, 502, 503, 504) or attempt == 3:
                raise RuntimeError(f"SoundCloud HTTP {exc.code}: {exc.read(400).decode(errors='replace')}") from exc
            delay = exc.headers.get("Retry-After", "")
            time.sleep(min(int(delay), 30) if delay.isdigit() else 2 ** attempt)
    raise RuntimeError("Exhausted retries")

def oauth_login(client_id: str, client_secret: str, redirect_uri: str):
    parsed = urlparse(redirect_uri)
    if parsed.scheme != "http" or parsed.hostname not in ("127.0.0.1", "localhost"):
        raise ValueError("For safety, OAuth callback must be local http://127.0.0.1 or localhost")
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
    state = secrets.token_urlsafe(24)
    class Handler(http.server.BaseHTTPRequestHandler):
        code = None
        failure = None
        def do_GET(self):
            parsed_req = urlparse(self.path)
            params = parse_qs(parsed_req.query)
            if parsed_req.path != parsed.path or params.get("state", [""])[0] != state:
                self.send_error(403, "Invalid OAuth state/path")
                return
            Handler.code = params.get("code", [None])[0]
            Handler.failure = params.get("error", [None])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Authorization received. Return to your terminal.")
        def log_message(self, *args):
            pass
    auth_url = AUTH_HOST + "/authorize?" + urlencode({
        "client_id": client_id, "redirect_uri": redirect_uri,
        "response_type": "code", "code_challenge": challenge,
        "code_challenge_method": "S256", "state": state,
    })
    server = http.server.HTTPServer((parsed.hostname, parsed.port or 80), Handler)
    server.timeout = 180
    print("Open this URL to authorize your SoundCloud account:\n" + auth_url)
    print("Only authorize the account that owns the NRN tracks.")
    server.handle_request()
    server.server_close()
    if not Handler.code:
        raise RuntimeError("No authorization code received: " + str(Handler.failure or "timed out"))
    result = request_json(AUTH_HOST + "/oauth/token", method="POST", form={
        "grant_type": "authorization_code", "client_id": client_id,
        "client_secret": client_secret, "redirect_uri": redirect_uri,
        "code_verifier": verifier, "code": Handler.code,
    })
    return result["access_token"]

def fetch_owned_tracks(token: str, expected_permalink: str | None):
    me = request_json(API_HOST + "/me", token)
    profile = me.get("permalink", "")
    if expected_permalink and normalize(profile) != normalize(expected_permalink):
        raise RuntimeError("Connected SoundCloud account does not match expected handle: " + profile)
    tracks = []
    url = API_HOST + "/me/tracks?" + urlencode({"linked_partitioning": "true", "limit": 200})
    visited = set()
    while url:
        if url in visited or len(visited) > 500:
            raise RuntimeError("Pagination loop or unexpectedly large catalog")
        visited.add(url)
        response = request_json(url, token)
        if isinstance(response, list):
            tracks.extend(response)
            break
        tracks.extend(response.get("collection", []))
        url = response.get("next_href")
        if url and not url.startswith(API_HOST + "/"):
            raise RuntimeError("Unexpected pagination host")
    return me, tracks

def match_tracks(sc_tracks, songstats):
    by_isrc, by_title = {}, {}
    for item in songstats:
        name = item.get("title") or item.get("track_name") or ""
        for code in item.get("isrcs", []) or []:
            by_isrc.setdefault(normalize(code), []).append(item)
        by_title.setdefault(normalize(name), []).append(item)
    rows = []
    seen_ids = set()
    for track in sc_tracks:
        track_id = str(track.get("id") or track.get("urn") or "")
        if track_id in seen_ids:
            continue
        seen_ids.add(track_id)
        title = track.get("title", "")
        isrc = track.get("isrc") or track.get("publisher_metadata", {}).get("isrc") or ""
        candidates = by_isrc.get(normalize(isrc), []) if isrc else []
        method = "isrc" if candidates else ""
        if not candidates:
            candidates = by_title.get(normalize(title), [])
            method = "title" if candidates else ""
        status = "matched" if len(candidates) == 1 else "review_ambiguous" if candidates else "missing_songstats"
        candidate = candidates[0] if len(candidates) == 1 else {}
        rows.append({
            "soundcloud_id": track_id, "title": title, "soundcloud_url": track.get("permalink_url", ""),
            "isrc": isrc, "visibility": track.get("sharing", ""),
            "soundcloud_plays": track.get("playback_count", ""),
            "songstats_track_id": candidate.get("songstats_track_id", ""),
            "match_method": method if len(candidates) == 1 else "",
            "status": status,
        })
    return sorted(rows, key=lambda x: (x["status"], x["title"].casefold()))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--songstats", default="songstats-catalog.json", help="Read-only Songstats inventory JSON")
    parser.add_argument("--soundcloud-json", help="Offline SoundCloud API tracks JSON instead of live OAuth")
    parser.add_argument("--out", default="soundcloud-songstats-report.csv")
    parser.add_argument("--expected-handle", default="nicholasreyesnatividad")
    parser.add_argument("--redirect-uri", default=os.getenv("SOUNDCLOUD_REDIRECT_URI", DEFAULT_REDIRECT))
    args = parser.parse_args()
    baseline = json.loads(Path(args.songstats).read_text(encoding="utf-8"))
    if isinstance(baseline, dict):
        baseline = baseline.get("catalog", baseline.get("tracks", []))
    if not isinstance(baseline, list):
        raise ValueError("Songstats file must contain a list or {catalog:[...]}")
    if args.soundcloud_json:
        source = json.loads(Path(args.soundcloud_json).read_text(encoding="utf-8"))
        tracks = source if isinstance(source, list) else source.get("collection", source.get("tracks", []))
        profile_name = "offline import"
    else:
        client_id, client_secret = os.getenv("SOUNDCLOUD_CLIENT_ID"), os.getenv("SOUNDCLOUD_CLIENT_SECRET")
        if not client_id or not client_secret:
            parser.error("Set SOUNDCLOUD_CLIENT_ID and SOUNDCLOUD_CLIENT_SECRET or pass --soundcloud-json")
        token = oauth_login(client_id, client_secret, args.redirect_uri)
        me, tracks = fetch_owned_tracks(token, args.expected_handle)
        profile_name = me.get("permalink", "")
    rows = match_tracks(tracks, baseline)
    fields = ["soundcloud_id", "title", "soundcloud_url", "isrc", "visibility",
              "soundcloud_plays", "songstats_track_id", "match_method", "status"]
    with Path(args.out).open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    summary = {s: sum(r["status"] == s for r in rows) for s in ("matched", "missing_songstats", "review_ambiguous")}
    print(json.dumps({"profile": profile_name, "soundcloud_tracks": len(rows),
                      "songstats_baseline": len(baseline), "summary": summary,
                      "report": args.out}, indent=2))
    print("Read-only. Missing tracks are NOT automatically registered with Songstats.")

if __name__ == "__main__":
    main()
