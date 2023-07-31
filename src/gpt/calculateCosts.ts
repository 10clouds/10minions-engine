import { GPTModel, GPTExecuteRequestData, GPTMode, MODEL_DATA } from './types';
import { countTokens } from './countTokens';

export const calculateCosts = (model: GPTModel, requestData: GPTExecuteRequestData, result: string, mode: GPTMode) => {
  const functionsTokens = requestData.functions ? countTokens(JSON.stringify(requestData.functions), mode) : 0;

  const inputTokens = countTokens(JSON.stringify(requestData.messages), mode) + functionsTokens;

  const outputTokens = countTokens(result, mode);

  const inputCost = (inputTokens / 1000) * MODEL_DATA[model].inputCostPer1K;
  const outputCost = (outputTokens / 1000) * MODEL_DATA[model].outputCostPer1K;
  const totalCost = inputCost + outputCost;

  return totalCost;
};
