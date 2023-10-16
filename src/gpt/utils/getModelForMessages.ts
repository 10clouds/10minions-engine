import { ChatCompletionRequestMessage } from 'openai';

import { FAST_MODE_TOKENS, GPTMode, GPTModel } from '../types';
import { countTokens } from './countTokens';

export function getModelForMessages(
  messages: ChatCompletionRequestMessage[],
  mode: GPTMode,
  maxTokens: number,
): GPTModel {
  const messagesAsString = JSON.stringify(messages);
  let model: GPTModel = 'gpt-4-0613';

  if (mode === GPTMode.FAST) {
    model = 'gpt-3.5-turbo-16k-0613';

    const usedTokens = countTokens(messagesAsString, mode) + maxTokens;

    if (usedTokens < FAST_MODE_TOKENS) {
      model = 'gpt-3.5-turbo-0613';
    }
  }

  return model;
}
