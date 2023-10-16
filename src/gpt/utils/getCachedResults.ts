import { z } from 'zod';

import { getOpenAICacheManager } from '../../managers/OpenAICacheManager';
import { GPTExecuteRequestData } from '../types';
import { convertResult } from './convertResult';

export const getCachedResults = async <OutputTypeSchema extends z.ZodType>(
  requestData: GPTExecuteRequestData,
  outputSchema: OutputTypeSchema,
  onChunk: (chunk: string) => Promise<void>,
) => {
  const cachedResult =
    await getOpenAICacheManager().getCachedResult(requestData);

  if (cachedResult && typeof cachedResult === 'string') {
    await onChunk(cachedResult);

    return {
      result: convertResult(cachedResult, outputSchema),
      cost: 0,
    };
  }

  return null;
};
