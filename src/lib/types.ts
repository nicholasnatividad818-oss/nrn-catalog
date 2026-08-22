export type Track = {
  id: string;
  user_id?: string;
  title: string;
  version?: string;
  artist: string;
  featuredArtists?: string;
  album?: string;
  releaseDate?: string;
  isrc?: string;
  upc?: string;
  distributor?: string;
  bpm?: string;
  key?: string;
  duration?: string;
  genre?: string;
  lyrics?: string;
  songwriters?: string;
  producers?: string;
  engineers?: string;
  ownershipPct?: string;
  publishingPct?: string;
  masterPct?: string;
  spotifyId?: string;
  appleMusicId?: string;
  soundcloudId?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Release = {
  id: string;
  title: string;
  releaseType: "single" | "ep" | "album" | "compilation";
  upc?: string;
  distributor?: string;
  releaseDate?: string;
  trackIds: string[];
  coverUrl?: string;
  createdAt: string;
};

export type Contributor = {
  id: string;
  name: string;
  email?: string;
  role: "songwriter" | "producer" | "engineer" | "featured_artist" | "other";
};

export type OwnershipSplit = {
  id: string;
  trackId: string;
  contributor: string;
  splitType: "ownership" | "publishing" | "master";
  percentage: number;
};

export const GENRES = ["Hip Hop", "R&B", "Pop", "Electronic", "Afro", "Rock", "Jazz", "Classical", "Country", "Folk", "Other"];
export const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C Minor", "C# Minor", "D Minor", "E Minor", "F Minor", "G Minor", "A Minor", "B Minor"];
export const DISTRIBUTORS = ["TuneCore", "DistroKid", "UnitedMasters", "AWAL", "Empire", "CD Baby", "Ditto", "Other"];
