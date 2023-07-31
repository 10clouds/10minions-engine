import { TokenError } from './TokenError';
import { getModel } from './getModel';
import { GPTMode, MODEL_DATA } from './types';

interface EnsureICanRunThisParams {
  prompt: string;
  maxTokens: number;
  mode: GPTMode;
}

/**
 * Checks if the prompt can be handled by the model
 */
export const ensureICanRunThis = ({ prompt, maxTokens, mode }: EnsureICanRunThisParams) => {
  const model = getModel(mode);
  const usedTokens = MODEL_DATA[model].encode(prompt).length + maxTokens;

  if (usedTokens > MODEL_DATA[model].maxTokens) {
    console.error(`Not enough tokens to perform the modification. absolute minimum: ${usedTokens} available: ${MODEL_DATA[model].maxTokens}`);
    throw new TokenError(`Combination of file size, selection, and your command is too big for us to handle.`);
  }
};
