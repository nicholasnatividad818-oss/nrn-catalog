"use client";

import { Release, Track } from "@/lib/types";
import { createClient } from "./client";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

function num(v?: string): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: unknown): string | undefined {
  if (v == null || v === "") return undefined;
  return String(v);
}

export function rowToTrack(row: Record<string, unknown>): Track {
  return {
    id: String(row.id),
    user_id: str(row.user_id),
    title: String(row.title ?? ""),
    version: str(row.version),
    artist: String(row.artist ?? ""),
    featuredArtists: str(row.featured_artists),
    album: str(row.album),
    releaseDate: str(row.release_date),
    isrc: str(row.isrc),
    upc: str(row.upc),
    distributor: str(row.distributor),
    bpm: row.bpm != null ? String(row.bpm) : undefined,
    key: str(row.key),
    duration: str(row.duration_display),
    genre: str(row.genre),
    lyrics: str(row.lyrics),
    songwriters: str(row.songwriters),
    producers: str(row.producers),
    engineers: str(row.engineers),
    ownershipPct: row.ownership_pct != null ? String(row.ownership_pct) : undefined,
    publishingPct: row.publishing_pct != null ? String(row.publishing_pct) : undefined,
    masterPct: row.master_pct != null ? String(row.master_pct) : undefined,
    spotifyId: str(row.spotify_id),
    appleMusicId: str(row.apple_music_id),
    soundcloudId: str(row.soundcloud_id),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: str(row.updated_at),
  };
}

export function trackToRow(t: Track, userId: string) {
  const id = isUuid(t.id) ? t.id : crypto.randomUUID();
  return {
    id,
    user_id: userId,
    title: t.title,
    version: t.version || null,
    artist: t.artist,
    featured_artists: t.featuredArtists || null,
    album: t.album || null,
    release_date: t.releaseDate || null,
    isrc: t.isrc || null,
    upc: t.upc || null,
    distributor: t.distributor || null,
    bpm: num(t.bpm),
    key: t.key || null,
    duration_display: t.duration || null,
    genre: t.genre || null,
    lyrics: t.lyrics || null,
    songwriters: t.songwriters || null,
    producers: t.producers || null,
    engineers: t.engineers || null,
    ownership_pct: num(t.ownershipPct),
    publishing_pct: num(t.publishingPct),
    master_pct: num(t.masterPct),
    spotify_id: t.spotifyId || null,
    apple_music_id: t.appleMusicId || null,
    soundcloud_id: t.soundcloudId || null,
  };
}

export function rowToRelease(
  row: Record<string, unknown>,
  trackIds: string[]
): Release {
  const rt = String(row.release_type || "single");
  const releaseType =
    rt === "ep" || rt === "album" || rt === "compilation" || rt === "single"
      ? rt
      : "single";
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    releaseType,
    upc: str(row.upc),
    distributor: str(row.distributor),
    releaseDate: str(row.release_date),
    trackIds,
    coverUrl: str(row.cover_url),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function fetchRemoteCatalog(): Promise<{
  tracks: Track[];
  releases: Release[];
} | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [tracksRes, releasesRes, linksRes] = await Promise.all([
    supabase.from("tracks").select("*").eq("user_id", user.id),
    supabase.from("releases").select("*").eq("user_id", user.id),
    supabase.from("release_tracks").select("*").eq("user_id", user.id),
  ]);

  if (tracksRes.error || releasesRes.error || linksRes.error) {
    console.error("catalog fetch", tracksRes.error || releasesRes.error || linksRes.error);
    return null;
  }

  const tracks = (tracksRes.data || []).map((r) => rowToTrack(r as Record<string, unknown>));
  const links = (linksRes.data || []) as { release_id: string; track_id: string }[];
  const byRelease = new Map<string, string[]>();
  for (const link of links) {
    const list = byRelease.get(link.release_id) || [];
    list.push(link.track_id);
    byRelease.set(link.release_id, list);
  }
  const releases = (releasesRes.data || []).map((r) =>
    rowToRelease(r as Record<string, unknown>, byRelease.get(String((r as { id: string }).id)) || [])
  );
  return { tracks, releases };
}

export async function persistRemoteCatalog(store: {
  tracks: Track[];
  releases: Release[];
}): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const trackRows = store.tracks.map((t) => trackToRow(t, user.id));
  const idMap = new Map<string, string>();
  store.tracks.forEach((t, i) => idMap.set(t.id, trackRows[i].id));

  const releaseRows = store.releases.map((r) => {
    const id = isUuid(r.id) ? r.id : crypto.randomUUID();
    idMap.set(r.id, id);
    return {
      id,
      user_id: user.id,
      title: r.title,
      release_type: r.releaseType,
      upc: r.upc || null,
      distributor: r.distributor || null,
      release_date: r.releaseDate || null,
      cover_url: r.coverUrl || null,
    };
  });

  if (trackRows.length) {
    const { error } = await supabase.from("tracks").upsert(trackRows, { onConflict: "id" });
    if (error) console.error("tracks upsert", error);
  }
  if (releaseRows.length) {
    const { error } = await supabase.from("releases").upsert(releaseRows, { onConflict: "id" });
    if (error) console.error("releases upsert", error);
  }

  const remoteTracks = await supabase.from("tracks").select("id").eq("user_id", user.id);
  const keepTrack = new Set(trackRows.map((r) => r.id));
  const extraTracks = (remoteTracks.data || [])
    .map((r) => r.id as string)
    .filter((id) => !keepTrack.has(id));
  if (extraTracks.length) {
    await supabase.from("tracks").delete().in("id", extraTracks).eq("user_id", user.id);
  }

  const remoteReleases = await supabase.from("releases").select("id").eq("user_id", user.id);
  const keepRel = new Set(releaseRows.map((r) => r.id));
  const extraRels = (remoteReleases.data || [])
    .map((r) => r.id as string)
    .filter((id) => !keepRel.has(id));
  if (extraRels.length) {
    await supabase.from("releases").delete().in("id", extraRels).eq("user_id", user.id);
  }

  await supabase.from("release_tracks").delete().eq("user_id", user.id);
  const linkRows: { release_id: string; track_id: string; user_id: string }[] = [];
  for (const r of store.releases) {
    const releaseId = idMap.get(r.id);
    if (!releaseId || !isUuid(releaseId)) continue;
    for (const tid of r.trackIds) {
      const trackId = idMap.get(tid) || tid;
      if (!isUuid(trackId)) continue;
      linkRows.push({ release_id: releaseId, track_id: trackId, user_id: user.id });
    }
  }
  if (linkRows.length) {
    const { error } = await supabase.from("release_tracks").insert(linkRows);
    if (error) console.error("release_tracks insert", error);
  }
}
