import { z } from 'zod';

import { gptExecute } from '../../gpt/gptExecute';
import { GPTMode } from '../../gpt/types';
import { countTokens } from '../../gpt/utils/countTokens';
import { createFullPromptFromSections } from '../../gpt/utils/createFullPromptFromSections';
import { ensureIRunThisInRange } from '../../gpt/utils/ensureIRunThisInRange';

export interface WorkspaceFileData {
  path: string;
  content: string;
}

function createPrompt(fileData: WorkspaceFileData) {
  return createFullPromptFromSections({
    intro:
      `Generate a brief description - 2 sentence maximum long of what this file does based on FILE CONTEXT section.`.trim(),
    sections: {
      'FILE CONTEXT': fileData.content,
      'FILE PATH': fileData.path,
    },
  });
}

export async function mutateCreateFileDescription(fileData: WorkspaceFileData) {
  const promptWithContext = createPrompt(fileData);
  const mode: GPTMode = GPTMode.FAST;

  const minTokens = countTokens(fileData.content, mode) + 1000;
  const fullPromptTokens = countTokens(promptWithContext, mode);

  try {
    const maxTokens = ensureIRunThisInRange({
      prompt: promptWithContext,
      mode,
      preferredTokens: fullPromptTokens,
      minTokens,
    });

    const { result } = await gptExecute({
      fullPrompt: promptWithContext,
      mode,
      maxTokens,
      controller: new AbortController(),
      outputSchema: z
        .object({
          description: z
            .string()
            .describe(
              'Description of the file to identify what the file do and when to use it.',
            ),
        })
        .describe('File info'),
    });

    return result;
  } catch (error) {
    console.error(error);
  }
}
