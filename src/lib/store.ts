"use client";

import { Track, Release } from "./types";

const STORAGE_KEY = "nrn_catalog_v1";

type Store = {
  tracks: Track[];
  releases: Release[];
};

const seedTracks: Track[] = [
  {
    id: "seed-1",
    title: "Midnight Signals",
    artist: "NRN",
    featuredArtists: "Ava Sol",
    album: "Night Editions",
    releaseDate: "2024-03-12",
    isrc: "USABC2400001",
    upc: "194398123456",
    distributor: "TuneCore",
    bpm: "96",
    key: "F Minor",
    duration: "3:42",
    genre: "R&B",
    lyrics: "Neon lights on wet pavement\nMidnight signals call your name...",
    songwriters: "NRN, Ava Sol",
    producers: "NRN",
    engineers: "Milo Carter",
    ownershipPct: "60",
    publishingPct: "50",
    masterPct: "70",
    spotifyId: "3z8h0TU",
    appleMusicId: "123456789",
    soundcloudId: "nrn-midnight-signals",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "seed-2",
    title: "Analog Dreams (Remastered)",
    version: "Remastered",
    artist: "NRN",
    album: "Night Editions",
    releaseDate: "2023-11-01",
    isrc: "USABC2300099",
    distributor: "DistroKid",
    bpm: "102",
    key: "C# Minor",
    duration: "4:11",
    genre: "Electronic",
    songwriters: "NRN",
    producers: "NRN, Leo Park",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "seed-3",
    title: "Untitled Sketch 04",
    artist: "NRN",
    genre: "Hip Hop",
    bpm: "88",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const seedReleases: Release[] = [
  {
    id: "rel-1",
    title: "Night Editions",
    releaseType: "album",
    upc: "194398123456",
    distributor: "TuneCore",
    releaseDate: "2024-03-12",
    trackIds: ["seed-1", "seed-2"],
    createdAt: new Date().toISOString(),
  },
];

function load(): Store {
  if (typeof window === "undefined") return { tracks: seedTracks, releases: seedReleases };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tracks: seedTracks, releases: seedReleases };
    const parsed = JSON.parse(raw);
    if (!parsed.tracks || !Array.isArray(parsed.tracks)) return { tracks: seedTracks, releases: seedReleases };
    return { tracks: parsed.tracks, releases: parsed.releases || seedReleases };
  } catch {
    return { tracks: seedTracks, releases: seedReleases };
  }
}

function save(store: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let memory: Store | null = null;

export function getStore(): Store {
  if (memory) return memory;
  memory = load();
  return memory;
}

export function setStore(updater: (s: Store) => Store) {
  const current = getStore();
  memory = updater(current);
  save(memory);
  window.dispatchEvent(new Event("nrn_store_update"));
}

export function resetStore() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  memory = { tracks: [...seedTracks], releases: [...seedReleases] };
  if (typeof window !== "undefined") save(memory);
}

export function healthForTrack(t: Track) {
  const missing: string[] = [];
  if (!t.isrc) missing.push("ISRC");
  if (!t.upc) missing.push("UPC");
  if (!t.bpm) missing.push("BPM");
  if (!t.key) missing.push("Key");
  if (!t.duration) missing.push("Duration");
  if (!t.genre) missing.push("Genre");
  if (!t.lyrics) missing.push("Lyrics");
  if (!t.distributor) missing.push("Distributor");
  if (!t.songwriters) missing.push("Songwriters");
  if (!t.ownershipPct) missing.push("Ownership");
  if (!t.spotifyId && !t.appleMusicId && !t.soundcloudId) missing.push("Platform ID");
  const score = Math.round(((11 - missing.length) / 11) * 100);
  return { missing, score, count: missing.length };
}
