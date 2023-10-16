import { z } from 'zod';

import { gptExecute } from '../../gpt/gptExecute';
import { GPTMode, QUALITY_MODE_TOKENS } from '../../gpt/types';
import { countTokens } from '../../gpt/utils/countTokens';
import { ensureIRunThisInRange } from '../../gpt/utils/ensureIRunThisInRange';
import { mutateAppendToLogNoNewline } from '../../tasks/logs/mutators/mutateAppendToLogNoNewline';
import { mutateReportSmallProgress } from '../../tasks/mutators/mutateReportSmallProgress';
import { MinionTask } from '../MinionTask';
import { createPrompt, PromptData } from '../prompts/createModificationPrompt';
import { trimKnowledge } from '../utils/trimKnowledge';

const EXTRA_TOKENS = 500;

export async function mutateCreateModification(task: MinionTask) {
  if (task.strategyId === '') {
    throw new Error('Classification is undefined');
  }

  task.modificationDescription = '';
  const document = await task.document();
  const userQuery = task.userQuery;
  const selectedText = task.selectedText;
  const fullFileContents = task.getOriginalContent;
  const isCancelled = () => {
    return task.stopped;
  };

  const promptData: PromptData = {
    selectedText,
    document,
    fullFileContents,
    selectionPosition: task.selection.start,
    userQuery,
    fileName: task.baseName,
  };
  let promptWithContext = createPrompt(promptData);

  const minTokens =
    countTokens(fullFileContents, GPTMode.QUALITY) + EXTRA_TOKENS;
  const fullPromptTokens =
    countTokens(promptWithContext, GPTMode.QUALITY) + EXTRA_TOKENS;

  const mode: GPTMode =
    fullPromptTokens > QUALITY_MODE_TOKENS ? GPTMode.FAST : GPTMode.QUALITY;

  let maxTokens = ensureIRunThisInRange({
    prompt: promptWithContext,
    mode,
    preferredTokens: fullPromptTokens,
    minTokens,
  });

  const promptWithKnowledgeData = trimKnowledge({
    maxTokens,
    knowledge: task.relevantKnowledge || [],
    mode,
    createPrompt,
    promptData,
    minTokens,
    extraTokens: EXTRA_TOKENS,
  });

  if (promptWithKnowledgeData) {
    const { maxTokens: newTokens, newPrompt } = promptWithKnowledgeData;
    maxTokens = newTokens;
    promptWithContext = newPrompt;
  }

  const { result, cost } = await gptExecute({
    fullPrompt: promptWithContext,
    onChunk: async (chunk: string) => {
      task.modificationDescription += chunk;
      mutateAppendToLogNoNewline(task, chunk);
      mutateReportSmallProgress(task);
    },
    isCancelled,
    mode,
    maxTokens,
    controller: new AbortController(),
    outputSchema: z.string(),
  });

  task.modificationDescription = result;
  task.totalCost += cost;

  mutateReportSmallProgress(task);
  mutateAppendToLogNoNewline(task, '\n\n');
}
