import { TokenError } from '../TokenError';
import { GPTMode, MODEL_DATA } from '../types';
import { countTokens } from './countTokens';
import { getModel } from './getModel';

interface EnsureICanRunThisInRangeParams {
  prompt: string;
  minTokens: number;
  preferredTokens: number;
  mode: GPTMode;
}
/**
 * @EXTRA_BUFFER_FOR_ENCODING_OVERHEAD provides a safety margin for token encoding overhead,
 * ensuring you have enough tokens for the operation while accounting for potential
 * additional tokens needed during encoding.
 */
const EXTRA_BUFFER_FOR_ENCODING_OVERHEAD = 50;

/**
 * Checks if the given prompt can fit within a specified range of token lengths
 * for the specified AI model.
 */
export function ensureIRunThisInRange({
  prompt,
  minTokens,
  preferredTokens,
  mode,
}: EnsureICanRunThisInRangeParams): number {
  const roundedMinTokens = Math.ceil(minTokens);
  const roundedPreferredTokens = Math.ceil(preferredTokens);

  const model = getModel(mode);
  const usedTokens =
    countTokens(prompt, mode) + EXTRA_BUFFER_FOR_ENCODING_OVERHEAD;
  const availableTokens = MODEL_DATA[model].maxTokens - usedTokens;

  if (availableTokens < roundedMinTokens) {
    console.error(
      `Not enough tokens to perform the modification. absolute minimum: ${roundedMinTokens} available: ${availableTokens}`,
    );
    throw new TokenError(
      `Combination of file size, selection, and your command is too big for us to handle.`,
    );
  }

  return Math.min(availableTokens, roundedPreferredTokens);
}
