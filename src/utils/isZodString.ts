import { z } from 'zod';

export function isZodString(schema: z.ZodType): boolean {
  const parseResult = schema.safeParse('');

  return parseResult.success;
}
