import { z } from 'zod';

export const knowledgeSchema = z.object({
  id: z.string(),
  description: z.string(),
  content: z.string(),
  functions: z
    .array(
      z.object({
        functionName: z.string(),
        description: z.string(),
        fullFunction: z.string().optional(),
      }),
    )
    .optional(),
});

export type Knowledge = z.infer<typeof knowledgeSchema>;
