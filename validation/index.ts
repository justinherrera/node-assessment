import { z } from "zod";

export const TodoSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullish(),
  completed: z.boolean(),
});