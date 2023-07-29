import { GPTMode, MODEL_DATA } from "./types";
import { getModel } from "./getModel";

export function countTokens(text: string, mode: GPTMode) {
  const model = getModel(mode);

  return MODEL_DATA[model].encode(text).length;
}
