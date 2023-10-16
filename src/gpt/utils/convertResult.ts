import { z } from 'zod';

import { isZodString } from '../../utils/isZodString';

export function convertResult<OutputTypeSchema extends z.ZodType>(
  result: string,
  outputSchema: OutputTypeSchema,
): z.infer<OutputTypeSchema> {
  if (isZodString(outputSchema)) {
    return result;
  }
  const parseResult = outputSchema.safeParse(JSON.parse(result));
  if (parseResult.success) {
    return parseResult.data as OutputTypeSchema;
  }
  throw new Error(`Could not parse result: ${result}`);
}
