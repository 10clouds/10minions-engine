import { countTokens } from '../../gpt/countTokens';
import { ensureIRunThisInRange } from '../../gpt/ensureIRunThisInRange';
import { getModel } from '../../gpt/getModel';
import { GPTMode, MODEL_DATA } from '../../gpt/types';
import { WorkspaceFilesKnowledge } from '../generateDescriptionForWorkspaceFiles';

export type PromptKnowledge = { knowledge?: WorkspaceFilesKnowledge[] };

interface Parameters<T> {
  maxTokens: number;
  knowledge: WorkspaceFilesKnowledge[];
  mode: GPTMode;
  createPrompt: (promptData: T) => string;
  promptData: T;
  minTokens: number;
  extraTokens?: number;
}

export const trimKnowledge = <T extends PromptKnowledge>({
  knowledge = [],
  mode,
  createPrompt,
  promptData,
  minTokens,
  maxTokens,
  extraTokens = 0,
}: Parameters<T>) => {
  const modelMaxTokens = MODEL_DATA[getModel(mode)].maxTokens;
  if (!knowledge.length || maxTokens >= modelMaxTokens) {
    return null;
  }

  const targetSum = modelMaxTokens - maxTokens;
  let currentSum = 0;
  const selectedKnowledge: WorkspaceFilesKnowledge[] = [];

  for (const k of knowledge) {
    const { summaryContentTokensCount } = k;
    if (currentSum + summaryContentTokensCount[mode] > targetSum) {
      break;
    }
    selectedKnowledge.push(k);
    currentSum += summaryContentTokensCount[mode];
  }

  console.log('SELECTED KNOWLEDGE: ', selectedKnowledge);

  const newPrompt = createPrompt({
    ...promptData,
    knowledge: selectedKnowledge,
  });

  const fullPromptTokens = countTokens(newPrompt, mode) + extraTokens;

  const newMaxTokens = ensureIRunThisInRange({
    prompt: newPrompt,
    mode,
    preferedTokens: fullPromptTokens,
    minTokens,
  });

  console.log('NEW MAX TOKENS: ', newMaxTokens);

  return {
    newPrompt,
    maxTokens: newMaxTokens,
  };
};
