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
  if (!knowledge.length) {
    return null;
  }
  if (maxTokens < modelMaxTokens) {
    const targetSum = modelMaxTokens - maxTokens;
    let currentSum = knowledge[0].summaryContentTokensCount[mode];
    const selectedKnowledge: WorkspaceFilesKnowledge[] = [];

    knowledge.forEach((knowledge) => {
      const { summaryContentTokensCount } = knowledge;
      if (currentSum <= targetSum) {
        selectedKnowledge.push(knowledge);
        currentSum += summaryContentTokensCount[mode];
      }
    });

    console.log('SELECTED KNOWLEDGE: ', selectedKnowledge);

    const newPrompt = createPrompt({ ...promptData, knowledge: selectedKnowledge });

    const fullPromptTokens = countTokens(newPrompt, mode) + extraTokens;

    maxTokens = ensureIRunThisInRange({
      prompt: newPrompt,
      mode,
      preferedTokens: fullPromptTokens,
      minTokens: minTokens,
    });

    return {
      newPrompt,
      maxTokens,
    };
  }

  return null;
};
