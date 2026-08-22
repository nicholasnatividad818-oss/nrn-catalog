import Papa from "papaparse";
import { Track } from "./types";

export const CSV_HEADERS = [
  "title",
  "version",
  "artist",
  "featuredArtists",
  "album",
  "releaseDate",
  "isrc",
  "upc",
  "distributor",
  "bpm",
  "key",
  "duration",
  "genre",
  "lyrics",
  "songwriters",
  "producers",
  "engineers",
  "ownershipPct",
  "publishingPct",
  "masterPct",
  "spotifyId",
  "appleMusicId",
  "soundcloudId",
] as const;

const ALIASES: Record<string, string> = {
  "track title": "title",
  "song title": "title",
  title: "title",
  version: "version",
  artist: "artist",
  "featured artists": "featuredArtists",
  "featured_artists": "featuredArtists",
  featuredArtists: "featuredArtists",
  album: "album",
  "release date": "releaseDate",
  "release_date": "releaseDate",
  isrc: "isrc",
  "isrc_code": "isrc",
  upc: "upc",
  barcode: "upc",
  distributor: "distributor",
  bpm: "bpm",
  key: "key",
  duration: "duration",
  genre: "genre",
  lyrics: "lyrics",
  songwriters: "songwriters",
  "song writers": "songwriters",
  producers: "producers",
  engineers: "engineers",
  "ownership %": "ownershipPct",
  ownership: "ownershipPct",
  ownershipPct: "ownershipPct",
  publishing: "publishingPct",
  publishingPct: "publishingPct",
  master: "masterPct",
  masterPct: "masterPct",
  spotifyId: "spotifyId",
  "spotify_id": "spotifyId",
  appleMusicId: "appleMusicId",
  "apple_music_id": "appleMusicId",
  soundcloudId: "soundcloudId",
  "soundcloud_id": "soundcloudId",
};

export function normalizeHeader(h: string): string {
  const key = h.trim().toLowerCase();
  return ALIASES[key] || ALIASES[h.trim()] || h.trim();
}

export function tracksToCsv(tracks: Track[]): string {
  const rows = tracks.map((t) => {
    const r: Record<string, string> = {};
    CSV_HEADERS.forEach((h) => (r[h] = (t as any)[h] || ""));
    return r;
  });
  return Papa.unparse(rows, { columns: [...CSV_HEADERS] as string[] });
}

export function parseCsv(text: string): { data: Record<string, string>[]; errors: string[] } {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });
  const errors = result.errors.map((e) => `Row ${e.row}: ${e.message}`);
  // filter unknown headers
  const data = (result.data as any[]).filter((r) => r.title || r.artist);
  return { data, errors };
}
