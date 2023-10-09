import { TokenError } from './TokenError';
import { countTokens } from './countTokens';
import { getModel } from './getModel';
import { GPTMode, MODEL_DATA } from './types';

interface EnsureICanRunThisInRangeParams {
  prompt: string;
  minTokens: number;
  preferedTokens: number;
  mode: GPTMode;
}

/**
 * Checks if the given prompt can fit within a specified range of token lengths
 * for the specified AI model.
 */
export function ensureIRunThisInRange({ prompt, minTokens, preferedTokens, mode }: EnsureICanRunThisInRangeParams): number {
  /**
   * @EXTRA_BUFFER_FOR_ENCODING_OVERHEAD provides a safety margin for token encoding overhead,
   * ensuring you have enough tokens for the operation while accounting for potential
   * additional tokens needed during encoding.
   */
  const EXTRA_BUFFER_FOR_ENCODING_OVERHEAD = 50;

  minTokens = Math.ceil(minTokens);
  preferedTokens = Math.ceil(preferedTokens);

  const model = getModel(mode);
  const usedTokens = countTokens(prompt, mode) + EXTRA_BUFFER_FOR_ENCODING_OVERHEAD;
  const availableTokens = MODEL_DATA[model].maxTokens - usedTokens;

  if (availableTokens < minTokens) {
    console.error(`Not enough tokens to perform the modification. absolute minimum: ${minTokens} available: ${availableTokens}`);
    throw new TokenError(`Combination of file size, selection, and your command is too big for us to handle.`);
  }

  return Math.min(availableTokens, preferedTokens);
}
