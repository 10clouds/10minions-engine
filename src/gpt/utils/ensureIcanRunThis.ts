import { TokenError } from '../TokenError';
import { GPTExecuteRequestPrompt, GPTMode, MODEL_DATA } from '../types';
import { countTokens } from './countTokens';
import { getModel } from './getModel';

interface EnsureICanRunThisParams {
  prompt: GPTExecuteRequestPrompt;
  maxTokens: number;
  mode: GPTMode;
}

/**
 * Checks if the prompt can be handled by the model
 */
export const ensureICanRunThis = ({
  prompt,
  maxTokens,
  mode,
}: EnsureICanRunThisParams) => {
  const model = getModel(mode);
  const messages = Array.isArray(prompt)
    ? prompt
    : [{ role: 'user', content: prompt }];
  const messagesAsString = JSON.stringify(messages);
  const usedTokens = countTokens(messagesAsString, mode);
  const modelMaxTokens = MODEL_DATA[model].maxTokens;

  if (usedTokens > modelMaxTokens) {
    console.error(
      `Not enough tokens to perform the modification. absolute minimum: ${usedTokens} available: ${modelMaxTokens}`,
    );
    throw new TokenError(
      `Combination of file size, selection, and your command is too big for us to handle.`,
    );
  }
};
