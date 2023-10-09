import { getModel } from './getModel';
import { GPTMode, MODEL_DATA } from './types';

export function countTokens(text: string, mode: GPTMode) {
  const model = getModel(mode);

  return MODEL_DATA[model].encode(text).length;
}
