import { TokenError } from './TokenError';
import { getModel } from './getModel';
import { GPTExecuteRequestPrompt, GPTMode, MODEL_DATA } from './types';

interface EnsureICanRunThisParams {
  prompt: GPTExecuteRequestPrompt;
  maxTokens: number;
  mode: GPTMode;
}

/**
 * Checks if the prompt can be handled by the model
 */
export const ensureICanRunThis = ({ prompt, maxTokens, mode }: EnsureICanRunThisParams) => {
  const model = getModel(mode);
  const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];
  const messagesAsString = JSON.stringify(messages);
  const usedTokens = MODEL_DATA[model].encode(messagesAsString).length + maxTokens;

  if (usedTokens > MODEL_DATA[model].maxTokens) {
    console.error(`Not enough tokens to perform the modification. absolute minimum: ${usedTokens} available: ${MODEL_DATA[model].maxTokens}`);
    throw new TokenError(`Combination of file size, selection, and your command is too big for us to handle.`);
  }
};
