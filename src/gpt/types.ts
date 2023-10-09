import { encode as encodeGPT35 } from 'gpt-tokenizer/cjs/model/gpt-3.5-turbo';
import { encode as encodeGPT4 } from 'gpt-tokenizer/cjs/model/gpt-4';
import {
  type ChatCompletionRequestMessage,
  type CreateChatCompletionRequest,
} from 'openai';
import { JsonSchema7Type } from 'zod-to-json-schema/src/parseDef';

export enum GPTMode {
  FAST = 'FAST',
  QUALITY = 'QUALITY',
}

export const QUALITY_MODE_TOKENS = 8192;
export const FAST_MODE_TOKENS = 4096;
export const FAST_MODE_TURBO_TOKENS = 16384;

export type GPTModel =
  | 'gpt-4-0613'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-3.5-turbo-16k-0613'; // | "gpt-4-32k-0613"

export type FunctionDef = {
  name: string;
  description: string;
  parameters: JsonSchema7Type;
};

export type GPTExecuteRequestData = CreateChatCompletionRequest;
export type GPTExecuteRequestMessage = ChatCompletionRequestMessage;
export type GPTExecuteRequestPrompt = string | GPTExecuteRequestMessage[];

export type ModelData = {
  [key in GPTModel]: {
    maxTokens: number;
    encode: typeof encodeGPT4;
    inputCostPer1K: number;
    outputCostPer1K: number;
  };
};

export interface ModelsResponseData {
  objest: string;
  data: {
    id: string;
    object: string;
    created: Date | number;
    owned_by: string;
    root: string;
    permissions: {
      allow_create_engine: boolean;
      allow_fine_tuning: boolean;
      allow_logprobs: boolean;
      allow_sampling: boolean;
      allow_search_indices: boolean;
      allow_view: boolean;
      created: Date | number;
      group: string;
      id: string;
      is_blocking: boolean;
      object: string;
      organization: string;
    }[];
  }[];
}

export interface ParsedLine {
  id: string;
  object: string;
  created: Date | number;
  model: string;
  choices: {
    index: number;
    delta: {
      role: string;
      content: string | null;
      function_call: {
        name: string;
        arguments: string;
      };
      finish_reason: string | null;
    };
  }[];
  error: {
    message: string;
  };
}

export const MODEL_DATA: ModelData = {
  'gpt-4-0613': {
    maxTokens: QUALITY_MODE_TOKENS,
    encode: encodeGPT4,
    inputCostPer1K: 0.03,
    outputCostPer1K: 0.06,
  },
  //"gpt-4-32k-0613": { maxTokens: 32768, encode: encodeGPT4, inputCostPer1K: 0.06, outputCostPer1K: 0.12 },
  'gpt-3.5-turbo-0613': {
    maxTokens: FAST_MODE_TOKENS,
    encode: encodeGPT35,
    inputCostPer1K: 0.0015,
    outputCostPer1K: 0.002,
  },
  'gpt-3.5-turbo-16k-0613': {
    maxTokens: FAST_MODE_TURBO_TOKENS,
    encode: encodeGPT35,
    inputCostPer1K: 0.003,
    outputCostPer1K: 0.004,
  },
};

export const MODEL_NAMES = Object.keys(MODEL_DATA) as GPTModel[];
