import { z } from 'zod';

import { countTokens } from '../gpt/countTokens';
import { createFullPromptFromSections } from '../gpt/createFullPromptFromSections';
import { ensureIRunThisInRange } from '../gpt/ensureIRunThisInRange';
import { gptExecute } from '../gpt/gptExecute';
import { GPTMode } from '../gpt/types';
import { MinionTaskSolution } from '../minionTasks/advancedCodeChangeStrategy';
import { MinionTask } from '../minionTasks/MinionTask';
import { SolutionWithMeta } from './FitnessFunction';

const EXTRA_TOKENS = 200;

export interface ImproveSolutionFixResult {
  name: string;
  call: () => Promise<{
    resultingCode: string;
    modificationDescription: string;
    modificationProcedure: string;
  }>;
}

export function improveSolutionFix({
  task,
  solutionWithMeta,
  suggestions,
}: {
  task: MinionTask;
  solutionWithMeta: SolutionWithMeta<MinionTaskSolution>;
  suggestions: string;
}): ImproveSolutionFixResult {
  console.log('Improving solution fix...');
  const { modificationDescription, modificationProcedure, userQuery } = task;
  const solution = solutionWithMeta.solution.resultingCode;
  const fullPrompt = createFullPromptFromSections({
    intro:
      'Improve the following SOLUTION and MODIFICATION_PROCEDURE that fullfill USER_QUERY request based on MODIFICATION_DESCRIPTION, use SUGGESTIONS as guidance. Do not output any section markers or additional sections in your response, just the new improved solution, improved MODIFICATION_PROCEDURE.',
    sections: {
      MODIFICATION_DESCRIPTION: modificationDescription,
      MODIFICATION_PROCEDURE: modificationProcedure,
      USER_QUERY: userQuery,
      SOLUTION: solution,
      SUGGESTIONS: suggestions,
      'YOUR PROPOSED NEW SOLUTION': '',
    },
  });
  const mode: GPTMode = GPTMode.FAST;
  const minTokens = countTokens(solution, mode) + EXTRA_TOKENS;
  const fullPromptTokens = countTokens(fullPrompt, mode) + EXTRA_TOKENS;

  const maxTokens = ensureIRunThisInRange({
    prompt: fullPrompt,
    mode,
    preferedTokens: fullPromptTokens,
    minTokens,
  });

  const improveFixCallFunction = async () => {
    const { result, cost } = await gptExecute({
      fullPrompt,
      maxTokens,
      mode,
      outputSchema: z.object({
        resultingCode: z.string(),
        modificationProcedure: z.string(),
      }),
    });
    task.totalCost += cost;

    return {
      resultingCode: result.resultingCode,
      modificationDescription,
      modificationProcedure: result.modificationProcedure,
    };
  };

  return {
    name: `Improve solution (${suggestions.replace(/\n/g, ',')})`,
    call: improveFixCallFunction,
  };
}
