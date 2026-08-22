import { z } from "zod";

export const releaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  releaseType: z.enum(["single", "ep", "album", "compilation"], {
    errorMap: () => ({ message: "Select a valid release type" }),
  }),
  upc: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d{12,13}$/.test(v.replace(/-/g, "")), {
      message: "UPC must be 12 or 13 digits",
    }),
  distributor: z.string().max(100).optional().or(z.literal("")),
  releaseDate: z.string().optional().or(z.literal("")),
  coverUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  trackIds: z.array(z.string().uuid()).default([]),
});

export type ReleaseInput = z.infer<typeof releaseSchema>;
