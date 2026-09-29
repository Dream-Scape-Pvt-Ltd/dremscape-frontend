import { z } from "zod";

export const trekFilterSchema = z.object({
  region: z.string().optional(),
  destination: z.string().optional(),
  difficulty: z.enum(["easy", "moderate", "demanding", "strenuous", "extreme"]).optional(),
  minDays: z.coerce.number().int().min(1).max(60).optional(),
  maxDays: z.coerce.number().int().min(1).max(60).optional(),
  maxAltitude: z.coerce.number().int().min(1000).max(9000).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  ordering: z.enum(["price", "-price", "duration", "-duration", "-rating"]).optional(),
});

export type TrekFilterInput = z.infer<typeof trekFilterSchema>;
