# SoundCloud → Songstats (NRN catalog)

**Status:** Read-only integration, not deployed. This workflow does **not** enroll tracks in Songstats or modify SoundCloud.

## What it does

- Uses SoundCloud OAuth 2.1 authorization code + S256 PKCE to connect to the **owner** account.
- Retrieves **all pages** of `GET /me/tracks` and verifies the SoundCloud handle before processing.
- Matches uploads against the 34 accessible Songstats tracks in `songstats-catalog.json` using ISRC (when present) or a normalized exact title.
- Writes an auditable CSV with SoundCloud URL, SoundCloud ID, title, ISRC, Songstats ID, match method and status.
- No tokens are written to disk, and the API is only used for reads and OAuth exchange.

## Preconditions

A SoundCloud developer application and API credentials are required. SoundCloud currently documents an **Artist Pro** requirement for developer-app registration; this may affect access. See [SoundCloud API documentation](https://developers.soundcloud.com/docs).

Register the exact OAuth callback URL: `http://127.0.0.1:8765/callback` (or an approved locally configured callback). Keep all credentials private. **Never commit them.**

## Run from this directory (Python 3.10+)

```bash
cd integrations/soundcloud_songstats
export SOUNDCLOUD_CLIENT_ID='your-client-id'
export SOUNDCLOUD_CLIENT_SECRET='your-client-secret'
python3 sync.py --out ./soundcloud-songstats-report.csv
```

Follow the printed authorize link, approve the correct account, and return to the terminal. When the browser displays authorization received, the script fetches `/me` and `/me/tracks`. Callback is loopback only. The expected handle defaults to `nicholasreyesnatividad`.

**Offline import:** with an existing JSON export of SoundCloud `/me/tracks` objects:

```bash
python3 sync.py --soundcloud-json ./soundcloud-tracks.json --out ./soundcloud-songstats-report.csv
```

## Interpret the CSV

- `matched`: one ISRC or exact-normalized title match in Songstats. A title-only match should be reviewed before claiming an identity match.
- `missing_songstats`: no match; **candidate for review**, not proof the track is absent from Songstats or a safe auto-create request.
- `review_ambiguous`: more than one plausible Songstats match; manual review required.

Manually review differences in mixes, versions, remixes, alternate artist profiles, private tracks, deleted uploads and ISRC aliases. Compare SoundCloud totals with native dashboards: Songstats has previously reported `tracks_total=30` while returning 34 records.

## Integration limits

1. The connected Songstats MCP currently exposes **read** tools only; it cannot create or subscribe to tracks. This code intentionally does **not** fake a Songstats registration endpoint.
2. The existing baseline comes from the authorized Songstats profile `fs4b5te3`; refresh it from Songstats before recurring runs as the catalog grows.
3. An end-to-end OAuth test requires the account owner's consent and API credentials. Running this branch alone does not connect accounts.
4. Do not push token files or CSVs containing private tracks. This directory's report files should be handled as private.
5. When a Songstats write capability becomes available, add an explicit reviewed/approved registration stage; never auto-create records based only on title similarity.

## Testing

```bash
python3 -m unittest discover -s tests -v
```

## References

- [SoundCloud developer guide](https://developers.soundcloud.com/docs)
- [SoundCloud OpenAPI explorer](https://developers.soundcloud.com/docs/api/explorer/open-api)
