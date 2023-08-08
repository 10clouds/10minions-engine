import { z } from 'zod';

export const knowledgeSchema = z.object({
  id: z.string(),
  description: z.string(),
  content: z.string(),
});

export type Knowledge = z.infer<typeof knowledgeSchema>;
