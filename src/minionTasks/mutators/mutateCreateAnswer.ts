import { MinionTask } from '../MinionTask';
import { EditorDocument, EditorPosition } from '../../managers/EditorManager';
import { gptExecute } from '../../gpt/gptExecute';
import { countTokens } from '../../gpt/countTokens';
import { ensureIRunThisInRange } from '../../gpt/ensureIRunThisInRange';
import { GPTMode } from '../../gpt/types';
import { z } from 'zod';
import { mutateAppendToLog } from '../../tasks/mutators/mutateAppendToLog';
import { mutateReportSmallProgress } from '../../tasks/mutators/mutateReportSmallProgress';
import { createFullPromptFromSections } from '../../gpt/createFullPromptFromSections';

function createPrompt(
  selectedText: string,
  document: EditorDocument,
  fullFileContents: string,
  selectionPosition: EditorPosition,
  userQuery: string,
  fileName: string,
) {
  return createFullPromptFromSections({
    intro: `
You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to tell him about something, the task is provided below in TASK section.
Perform that task.

Your job is to professionally answer the question.

Think about what your collegue might have in mind when he wrote his task, and try to fulfill his intention. Try to follow the task as pricesely as possible.

Take this step by step, and describe your reasoning along the way.

At the end provide your final answer, this is the only thing that will be supplied to your collegue as a result of this task.
    `.trim(),
    sections: {
      ...(selectedText ? { [`FILE CONTEXT (Language: ${document.languageId})`]: fullFileContents } : {}),

      [`CODE SNIPPET ${
        selectedText
          ? `(starts on line ${selectionPosition.line + 1} column: ${selectionPosition.character + 1} in the file)`
          : `(Language: ${document.languageId})`
      }`]: selectedText ? selectedText : fullFileContents,
      [`TASK (applies to CODE SNIPPET section only, not the entire FILE CONTEXT)`]: userQuery,
    },
    outro: `
If the task is not clear or there is lack of details try to generate response base on file name.
File name: ${fileName}

Let's take it step by step.
`.trim(),
  });
}

export async function mutateCreateAnswer(task: MinionTask) {
  if (task.strategy === undefined) {
    throw new Error('Classification is undefined');
  }

  task.modificationDescription = '';

  const document = await task.document();
  const userQuery = task.userQuery;
  const selectedText = task.selectedText;
  const fullFileContents = task.originalContent;
  const isCancelled = () => {
    return task.stopped;
  };

  const promptWithContext = createPrompt(selectedText, document, fullFileContents, task.selection.start, userQuery, task.baseName);

  const tokensCode = countTokens(promptWithContext, GPTMode.FAST);
  const luxiouriosTokens = tokensCode * 1.5;
  const absoluteMinimumTokens = tokensCode;

  const tokensToUse = ensureIRunThisInRange({
    prompt: promptWithContext,
    mode: GPTMode.FAST,
    preferedTokens: luxiouriosTokens,
    minTokens: absoluteMinimumTokens,
  });

  const { result, cost } = await gptExecute({
    fullPrompt: promptWithContext,
    onChunk: async (chunk: string) => {
      task.inlineMessage += chunk;
      mutateAppendToLog(task, chunk);
      mutateReportSmallProgress(task);
    },
    isCancelled,
    mode: GPTMode.FAST,
    maxTokens: tokensToUse,
    controller: new AbortController(),
    outputSchema: z.string(),
  });

  task.inlineMessage = result;
  task.totalCost += cost;

  mutateReportSmallProgress(task);
  mutateAppendToLog(task, '\n\n');
}
