import fetch from 'node-fetch';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { getAnalyticsManager } from '../managers/AnalyticsManager';
import { getOpenAICacheManager } from '../managers/OpenAICacheManager';
import { isZodString } from '../utils/isZodString';
import { calculateCosts } from './calculateCosts';
import { ensureICanRunThis } from './ensureIcanRunThis';
import { processOpenAIResponseStream } from './processOpenAIResponseStream';
import { FAST_MODE_TOKENS, GPTExecuteRequestData, GPTExecuteRequestMessage, GPTExecuteRequestPrompt, GPTMode, GPTModel, MODEL_DATA } from './types';
import { countTokens } from './countTokens';

let openAIApiKey: string | undefined;
const MAX_REQUEST_ATTEMPTS = 3;

export function setOpenAIApiKey(apiKey: string) {
  openAIApiKey = apiKey;
}

function convertResult<OutputTypeSchema extends z.ZodType>(result: string, outputSchema: OutputTypeSchema): z.infer<OutputTypeSchema> {
  if (isZodString(outputSchema)) {
    return result as z.infer<OutputTypeSchema>;
  } else {
    const parseResult = outputSchema.safeParse(JSON.parse(result));
    if (parseResult.success) {
      return parseResult.data;
    } else {
      console.log('RESULT', result);
      console.log('SCHEMA', outputSchema);
      throw new Error(`Could not parse result: ${result}`);
    }
  }
}
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
}: {
  fullPrompt: GPTExecuteRequestPrompt;
  onChunk?: (chunk: string) => Promise<void>;
  isCancelled?: () => boolean;
  maxTokens?: number;
  mode: GPTMode;
  temperature?: number;
  controller?: AbortController;
  outputSchema: OutputTypeSchema;
  outputName?: string;
}): Promise<{
  result: z.infer<OutputTypeSchema>;
  cost: number;
}> {
  let model: GPTModel = 'gpt-4-0613';

  const messages: GPTExecuteRequestMessage[] = Array.isArray(fullPrompt) ? fullPrompt : [{ role: 'user', content: fullPrompt }];
  const messagesAsString = JSON.stringify(messages);

  if (mode === GPTMode.FAST) {
    model = 'gpt-3.5-turbo-16k-0613';

    const usedTokens = countTokens(messagesAsString, mode) + maxTokens;

    if (usedTokens < FAST_MODE_TOKENS) {
      model = 'gpt-3.5-turbo-0613';
    }
  }

  ensureICanRunThis({ prompt: fullPrompt, mode, maxTokens });

  const signal = controller.signal;

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found. Please set it in the settings.');
  }

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
              parameters: zodToJsonSchema(outputSchema, 'parameters').definitions?.parameters,
            },
          ],
        }),
  };

  const cachedResult = await getOpenAICacheManager().getCachedResult(requestData);

  function convertResult(result: string): z.infer<OutputTypeSchema> {
    if (isZodString(outputSchema)) {
      return result as z.infer<OutputTypeSchema>;
    } else {
      const parseResult = outputSchema.safeParse(JSON.parse(result));
      if (parseResult.success) {
        return parseResult.data;
      } else {
        throw new Error(`Could not parse result: ${result}`);
      }
    }
  }

  if (cachedResult && typeof cachedResult === 'string') {
    await onChunk(cachedResult);
    return {
      result: convertResult(cachedResult),
      cost: 0,
    };
  }

  for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify(requestData),
        signal,
      });

      const result = await processOpenAIResponseStream({
        response,
        onChunk,
        isCancelled,
        controller,
      });

      getAnalyticsManager().reportOpenAICall(requestData, result);
      const cost = calculateCosts(model, requestData, result, mode);

      return {
        result: convertResult(result),
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
