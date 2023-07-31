import { z } from 'zod';

export const knowledgeSchema = z.object({
  name: z.string(),
  description: z.string(),
  content: z.string(),
});

export type Knowledge = z.infer<typeof knowledgeSchema>;
