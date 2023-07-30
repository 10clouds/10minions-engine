import { z } from 'zod';

export function isZodString(schema: z.ZodType<any, any>): boolean {
  const parseResult = schema.safeParse('');
  return parseResult.success;
}
