import { z } from "zod";

export const trackSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  version: z.string().max(100).optional().or(z.literal("")),
  artist: z.string().min(1, "Artist is required").max(200),
  featuredArtists: z.string().max(500).optional().or(z.literal("")),
  album: z.string().max(200).optional().or(z.literal("")),
  releaseDate: z.string().optional().or(z.literal("")),
  isrc: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[A-Z]{2}[A-Z0-9]{3}\d{2}\d{5}$/.test(v.replace(/-/g, "").toUpperCase()), {
      message: "ISRC must be like USABC1234567 (CC-XXX-YY-NNNNN)",
    }),
  upc: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d{12,13}$/.test(v.replace(/-/g, "")), {
      message: "UPC must be 12 or 13 digits",
    }),
  distributor: z.string().max(100).optional().or(z.literal("")),
  bpm: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 20 && Number(v) <= 300), {
      message: "BPM must be 20–300",
    }),
  key: z.string().max(20).optional().or(z.literal("")),
  duration: z.string().max(20).optional().or(z.literal("")),
  genre: z.string().max(100).optional().or(z.literal("")),
  lyrics: z.string().max(20000).optional().or(z.literal("")),
  songwriters: z.string().max(1000).optional().or(z.literal("")),
  producers: z.string().max(1000).optional().or(z.literal("")),
  engineers: z.string().max(1000).optional().or(z.literal("")),
  ownershipPct: z.string().optional().or(z.literal("")),
  publishingPct: z.string().optional().or(z.literal("")),
  masterPct: z.string().optional().or(z.literal("")),
  spotifyId: z.string().max(200).optional().or(z.literal("")),
  appleMusicId: z.string().max(200).optional().or(z.literal("")),
  soundcloudId: z.string().max(200).optional().or(z.literal("")),
});

export type TrackInput = z.infer<typeof trackSchema>;

export function isrcExists(tracks: { isrc?: string }[], isrc: string, excludeId?: string) {
  if (!isrc) return false;
  const norm = isrc.replace(/-/g, "").toUpperCase();
  return tracks.some((t) => t.isrc?.replace(/-/g, "").toUpperCase() === norm && (t as any).id !== excludeId);
}
