import { z } from "zod";

export const winLikeSchema = z.object({ winId: z.string().uuid(), liked: z.boolean() });
export const winCommentSchema = z.object({ winId: z.string().uuid(), body: z.string().trim().min(1, "Write a comment first.").max(500) });