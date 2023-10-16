import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

import { getAnalyticsManager } from '../managers/AnalyticsManager';
import { isZodString } from '../utils/isZodString';
import { getCompletions } from './openAiRequests';
import {
  GPTExecuteRequestData,
  GPTExecuteRequestMessage,
  GPTExecuteRequestPrompt,
  GPTMode,
  GPTModel,
} from './types';
import { calculateCosts } from './utils/calculateCosts';
import { convertResult } from './utils/convertResult';
import { ensureICanRunThis } from './utils/ensureIcanRunThis';
import { getCachedResults } from './utils/getCachedResults';
import { getModelForMessages } from './utils/getModelForMessages';
import { processOpenAIResponseStream } from './utils/processOpenAIResponseStream';
import { getOpenAIApiKey } from './utils/setOpenAiKey';

interface GptExecuteParams<OutputTypeSchema extends z.ZodType> {
  fullPrompt: GPTExecuteRequestPrompt;
  onChunk?: (chunk: string) => Promise<void>;
  isCancelled?: () => boolean;
  maxTokens?: number;
  mode: GPTMode;
  temperature?: number;
  controller?: AbortController;
  outputSchema: OutputTypeSchema;
  outputName?: string;
}

type GptExecuteResult<OutputTypeSchema extends z.ZodType> = Promise<{
  result: z.infer<OutputTypeSchema>;
  cost: number;
}>;

const MAX_REQUEST_ATTEMPTS = 3;

export async function gptExecute<OutputTypeSchema extends z.ZodType>({
  fullPrompt,
  onChunk = async () => {},
  isCancelled = () => false,
  maxTokens = 2000,
  mode,
  temperature = 1,
  controller = new AbortController(),
  outputSchema,
  outputName = 'output',
}: GptExecuteParams<OutputTypeSchema>): GptExecuteResult<OutputTypeSchema> {
  const openAIApiKey = getOpenAIApiKey();
  const messages: GPTExecuteRequestMessage[] = Array.isArray(fullPrompt)
    ? fullPrompt
    : [{ role: 'user', content: fullPrompt }];
  const model: GPTModel = getModelForMessages(messages, mode, maxTokens);

  ensureICanRunThis({ prompt: fullPrompt, mode, maxTokens });

  const signal = controller.signal;

  const requestData: GPTExecuteRequestData = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: true,
    ...(isZodString(outputSchema)
      ? {}
      : {
          function_call: { name: outputName },
          functions: [
            {
              name: outputName,
              description: outputSchema.description || 'Output',
              parameters: zodToJsonSchema(outputSchema, 'parameters')
                .definitions?.parameters,
            },
          ],
        }),
  };

  for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt++) {
    try {
      const response = await getCompletions(openAIApiKey, requestData, signal);
      const cachedResult = await getCachedResults(
        requestData,
        outputSchema,
        onChunk,
      );

      if (cachedResult) {
        return cachedResult;
      }

      const result = await processOpenAIResponseStream({
        response,
        onChunk,
        isCancelled,
        controller,
      });

      getAnalyticsManager().reportOpenAICall(requestData, result);
      const cost = calculateCosts(model, requestData, result, mode);

      return {
        result: convertResult(result, outputSchema),
        cost,
      };
    } catch (error) {
      console.error(`Error on attempt ${attempt}: ${error}`);

      getAnalyticsManager().reportOpenAICall(requestData, {
        error: String(error),
      });

      if (attempt === MAX_REQUEST_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw new Error('Assertion: Should never get here');
}
