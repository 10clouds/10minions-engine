import { gptExecute } from '../../gpt/gptExecute';
import { countTokens } from '../../gpt/countTokens';
import { ensureIRunThisInRange } from '../../gpt/ensureIRunThisInRange';
import { GPTMode } from '../../gpt/types';
import { z } from 'zod';
import { createFullPromptFromSections } from '../../gpt/createFullPromptFromSections';

export interface WorkspaceFileData {
  path: string;
  content: string;
}

function createPrompt(fileData: WorkspaceFileData) {
  return createFullPromptFromSections({
    intro: `Generate a brief description - 2 sentence maximum long of what this file does and list the all functions like this 
      {functionName: name, description: "Describes when to use function and what it do", fullFunction: "function functionName{...function body...}" } 
      (skip functions from external libraries eg. React ones) 
      based on FILE CONTEXT section.`.trim(),
    sections: {
      'FILE CONTEXT': fileData.content,
      'FILE PATH': fileData.path,
    },
  });
}

export async function mutateCreateFileDescription(fileData: WorkspaceFileData, onProcessStart?: () => void) {
  onProcessStart?.();

  const promptWithContext = createPrompt(fileData);
  const mode: GPTMode = GPTMode.FAST;

  const minTokens = countTokens(fileData.content, mode) + 1000;
  const fullPromptTokens = countTokens(promptWithContext, mode);

  try {
    const maxTokens = ensureIRunThisInRange({
      prompt: promptWithContext,
      mode: mode,
      preferedTokens: fullPromptTokens,
      minTokens: minTokens,
    });

    const { result } = await gptExecute({
      fullPrompt: promptWithContext,
      mode,
      maxTokens,
      controller: new AbortController(),
      outputSchema: z
        .object({
          description: z.string().describe('Description of the file to identify what the file do and when to use it.'),
          functions: z
            .array(
              z.object({
                functionName: z.string().describe('Name of the function'),
                description: z.string().describe('Describes when to use function and what it do'),
                fullFunction: z.string().describe('Stores the full function').optional(),
              }),
            )
            .describe('List of functions used in the file.'),
        })
        .describe('File info'),
    });
    return result;
  } catch (error) {
    console.error(error);
  }
}
