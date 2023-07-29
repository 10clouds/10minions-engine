import { ModelData } from './types';
import { encode as encodeGPT35 } from 'gpt-tokenizer/cjs/model/gpt-3.5-turbo';
import { encode as encodeGPT4 } from 'gpt-tokenizer/cjs/model/gpt-4';

export const DEBUG_PROMPTS = process.env.DEBUG_PROMPTS === 'true';
export const DEBUG_RESPONSES = process.env.DEBUG_RESPONSES === 'true';

export const APPLYING_STAGE_NAME = 'Applying';
export const APPLIED_STAGE_NAME = 'Applied';
export const FINISHED_STAGE_NAME = 'Finished';
export const CANCELED_STAGE_NAME = 'Canceled';

export const MODEL_DATA: ModelData = {
  'gpt-4-0613': {
    maxTokens: 8192,
    encode: encodeGPT4,
    inputCostPer1K: 0.03,
    outputCostPer1K: 0.06,
  },
  //"gpt-4-32k-0613": { maxTokens: 32768, encode: encodeGPT4, inputCostPer1K: 0.06, outputCostPer1K: 0.12 },
  'gpt-3.5-turbo-0613': {
    maxTokens: 4096,
    encode: encodeGPT35,
    inputCostPer1K: 0.0015,
    outputCostPer1K: 0.002,
  },
  'gpt-3.5-turbo-16k-0613': {
    maxTokens: 16384,
    encode: encodeGPT35,
    inputCostPer1K: 0.003,
    outputCostPer1K: 0.004,
  },
};
