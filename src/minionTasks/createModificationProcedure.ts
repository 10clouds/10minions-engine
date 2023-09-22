import { z } from 'zod';
import { DEBUG_PROMPTS } from '../const';
import { countTokens } from '../gpt/countTokens';
import { ensureIRunThisInRange } from '../gpt/ensureIRunThisInRange';
import { gptExecute } from '../gpt/gptExecute';
import { GPTMode, QUALITY_MODE_TOKENS } from '../gpt/types';
import { trimKnowledge } from './utils/trimKnowledge';
import { createPrompt } from './prompts/createModificationProcedurePrompt';
import { WorkspaceFilesKnowledge } from './generateDescriptionForWorkspaceFiles';

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
  modification = modification.replace(
    /^(====+)([^=]+)(====+)$/gm,

    (match, p1, p2) => {
      return `#${p2}`;
    },
  );

  const promptData = { refCode, modification, fileName };
  let promptWithContext = createPrompt(promptData);
  const minTokens = countTokens(refCode, GPTMode.QUALITY) + EXTRA_TOKENS;
  const fullPromptTokens = countTokens(promptWithContext, GPTMode.QUALITY) + EXTRA_TOKENS;

  if (DEBUG_PROMPTS) {
    onChunk('<<<< PROMPT >>>>\n\n');
    onChunk(promptWithContext + '\n\n');
    onChunk('<<<< EXECUTION >>>>\n\n');
  }

  const mode: GPTMode = fullPromptTokens > QUALITY_MODE_TOKENS ? GPTMode.FAST : GPTMode.QUALITY;

  let maxTokens = ensureIRunThisInRange({
    prompt: promptWithContext,
    mode: mode,
    preferedTokens: fullPromptTokens,
    minTokens: minTokens,
  });

  const promptWithKnowledgeData = trimKnowledge({ maxTokens, knowledge, mode, createPrompt, promptData, minTokens, extraTokens: EXTRA_TOKENS });

  if (promptWithKnowledgeData) {
    const { maxTokens: newTokens, newPrompt } = promptWithKnowledgeData;
    maxTokens = newTokens;
    promptWithContext = newPrompt;
  }

  console.log('MODIFICATION PROCEDURE TOKENS: ', maxTokens);

  return await gptExecute({
    fullPrompt: promptWithContext,
    onChunk,
    maxTokens,
    temperature: 0,
    isCancelled,
    mode,
    outputSchema: z.string(),
  });
}
