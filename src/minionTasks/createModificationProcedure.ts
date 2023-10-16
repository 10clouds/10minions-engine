import { z } from 'zod';

import { DEBUG_PROMPTS } from '../const';
import { gptExecute } from '../gpt/gptExecute';
import { GPTMode, QUALITY_MODE_TOKENS } from '../gpt/types';
import { countTokens } from '../gpt/utils/countTokens';
import { ensureIRunThisInRange } from '../gpt/utils/ensureIRunThisInRange';
import { WorkspaceFilesKnowledge } from './generateDescriptionForWorkspaceFiles';
import { createPrompt } from './prompts/createModificationProcedurePrompt';
import { trimKnowledge } from './utils/trimKnowledge';

const EXTRA_TOKENS = 500;

export async function createModificationProcedure(
  refCode: string,
  modification: string,
  onChunk: (chunk: string) => Promise<void>,
  isCancelled: () => boolean,
  fileName: string,
  knowledge: WorkspaceFilesKnowledge[] = [],
) {
  //replace any lines with headers in format ===== HEADER ==== (must start and end the line without any additioanl characters) with # HEADER
  const formattedModification = modification.replace(
    /^(====+)([^=]+)(====+)$/gm,

    (match, p1, p2) => {
      return `#${p2}`;
    },
  );

  const promptData = { refCode, modification: formattedModification, fileName };
  let promptWithContext = createPrompt(promptData);
  const minTokens = countTokens(refCode, GPTMode.QUALITY) + EXTRA_TOKENS;
  const fullPromptTokens =
    countTokens(promptWithContext, GPTMode.QUALITY) + EXTRA_TOKENS;

  const mode: GPTMode =
    fullPromptTokens > QUALITY_MODE_TOKENS ? GPTMode.FAST : GPTMode.QUALITY;

  if (DEBUG_PROMPTS) {
    onChunk('<<<< PROMPT >>>>\n\n');
    onChunk(`${promptWithContext}\n\n`);
    onChunk('<<<< EXECUTION >>>>\n\n');
  }

  let maxTokens = ensureIRunThisInRange({
    prompt: promptWithContext,
    mode,
    preferredTokens: fullPromptTokens,
    minTokens,
  });

  const promptWithKnowledgeData = trimKnowledge({
    maxTokens,
    knowledge,
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

  console.log('MODIFICATION PROCEDURE TOKENS: ', maxTokens);

  return gptExecute({
    fullPrompt: promptWithContext,
    onChunk,
    maxTokens,
    temperature: 0.6,
    isCancelled,
    mode,
    outputSchema: z.string(),
  });
}
