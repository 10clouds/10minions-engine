import { MinionTask } from '../MinionTask';
import { gptExecute } from '../../gpt/gptExecute';
import { EditorDocument, EditorPosition } from '../../managers/EditorManager';
import { ensureIRunThisInRange } from '../../gpt/ensureIRunThisInRange';
import { countTokens } from '../../gpt/countTokens';
import { GPTMode } from '../../gpt/types';
import { z } from 'zod';
import { mutateAppendToLog } from '../../tasks/mutators/mutateAppendToLog';
import { TASK_STRATEGY_ID } from '../strategies';
import { mutateReportSmallProgress } from '../../tasks/mutators/mutateReportSmallProgress';

function createPrompt(
  classification: TASK_STRATEGY_ID,
  selectedText: string,
  document: EditorDocument,
  fullFileContents: string,
  selectionPosition: EditorPosition,
  userQuery: string,
  fileName: string,
) {
  const settingsKeyword = 'TODO'; //vscode.workspace.getConfiguration('10minions').get('taskCommentKeyword') || "TODO";

  return `
You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to help him with some code, the task is provided below in TASK section.
Perform that task.

Your job is to do the task, so your college will be exteremely happy. If asked for them, propose changes, deliver insightfull comments in the code and output to the user all of your logic and remarks in nice looking block comment.

Think about what your collegue might have in mind when he wrote his task, and try to fulfill his intention. Try to follow the task as pricesely as possible.

Take this step by step, first describe your plan, then elaborate on each step while providing code that needs to be changed.

Make sure to add a comment to each spot where you are making modifications, so it's clear to the collegue what and where you have modified.

Your collegue will only look at the final code, without you around, so make sure to provide all the necessary comments and explanations in the final code.

If you only modify a section of the code and leave the rest as is, as your final code segment, only output that specific section.

Do not provide the entire file or any bigger chunks than necessary.

You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to help him with some code, the task is provided below in TASK section.
Perform that task.

Your job is to do the task, so your college will be exteremely happy. If asked for them, propose changes, deliver insightfull comments in the code and output to the user all of your logic and remarks in nice looking block comment.

==== STRATEGIES FOR SPECIFIC TASKS ====
If asked to refactor code, critically analyze the provided code and propose a refactoring plan focusing on improving readability and maintainability. Your revised code should remain functional with no change in output or side effects. Suggest renaming functions, creating subroutines, or modifying types as needed, to achieve the aim of simplicity and readability. Ensure your code and any documentation meet the quality standards of a top open source project.  
If asked to write documentation, write nice comment at the top and consise to the point JSdocs above the signatures of each function.
If asked to remove comments, don't add your own comments as this is probably not what your college wants.
If asked to perform a task from a "${settingsKeyword}:" comment, perform the task and remove the comment.

${
  selectedText
    ? `
==== FILE CONTEXT (Language: ${document.languageId}) ====
${fullFileContents}  
`
    : ''
}

===== CODE SNIPPET ${
    selectedText
      ? `(starts on line ${selectionPosition.line + 1} column: ${selectionPosition.character + 1} in the file)`
      : `(Language: ${document.languageId})`
  } ====
${selectedText ? selectedText : fullFileContents}

===== TASK (applies to CODE SNIPPET section only, not the entire FILE CONTEXT) ====
${userQuery}

If the task is not clear or there is lack of details try to generate response base on file name.
File name: ${fileName}

Let's take it step by step.
`.trim();
}

export async function mutateCreateModification(task: MinionTask) {
  if (task.strategy === undefined) {
    throw new Error('Classification is undefined');
  }

  task.modificationDescription = '';

  const document = await task.document();
  const classification = task.strategy;
  const userQuery = task.userQuery;
  const selectedText = task.selectedText;
  const fullFileContents = task.originalContent;
  const isCancelled = () => {
    return task.stopped;
  };

  const promptWithContext = createPrompt(classification, selectedText, document, fullFileContents, task.selection.start, userQuery, task.baseName);

  const tokensCode = countTokens(promptWithContext, GPTMode.QUALITY);
  const luxiouriosTokens = tokensCode * 1.5;
  const absoluteMinimumTokens = tokensCode;

  const tokensToUse = ensureIRunThisInRange({
    prompt: promptWithContext,
    mode: GPTMode.QUALITY,
    preferedTokens: luxiouriosTokens,
    minTokens: absoluteMinimumTokens,
  });

  const { result, cost } = await gptExecute({
    fullPrompt: promptWithContext,
    onChunk: async (chunk: string) => {
      task.modificationDescription += chunk;
      mutateAppendToLog(task, chunk);
      mutateReportSmallProgress(task);
    },
    isCancelled,
    mode: GPTMode.QUALITY,
    maxTokens: tokensToUse,
    controller: new AbortController(),
    outputSchema: z.string(),
  });

  task.modificationDescription = result;
  task.totalCost += cost;

  mutateReportSmallProgress(task);
  mutateAppendToLog(task, '\n\n');
}
