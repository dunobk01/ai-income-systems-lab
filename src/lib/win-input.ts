import { z } from "zod";

export const winInputSchema = z.object({
  system: z.string().trim().min(1, "Enter an AI accomplishment.").max(120),
  note: z.string().trim().max(500).optional(),
});