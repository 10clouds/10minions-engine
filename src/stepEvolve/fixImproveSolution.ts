import { z } from 'zod';
import { MinionTask } from '../minionTasks/MinionTask';
import { SolutionWithMeta } from './FitnessFunction';
import { gptExecute } from '../gpt/gptExecute';
import { createFullPromptFromSections } from '../gpt/createFullPromptFromSections';
import { GPTMode, QUALITY_MODE_TOKENS } from '../gpt/types';
import { countTokens } from '../gpt/countTokens';
import { MinionTaskSolution } from '../minionTasks/advancedCodeChangeStrategy';
import { ensureIRunThisInRange } from '../gpt/ensureIRunThisInRange';

const EXTRA_TOKENS = 200;

export function improveSolutionFix({
  task,
  solutionWithMeta,
  suggestions,
}: {
  task: MinionTask;
  solutionWithMeta: SolutionWithMeta<MinionTaskSolution>;
  suggestions: string;
}) {
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

  const minTokens = countTokens(solution, GPTMode.QUALITY) + EXTRA_TOKENS;
  const fullPromptTokens = countTokens(fullPrompt, GPTMode.QUALITY) + EXTRA_TOKENS;

  const mode: GPTMode = fullPromptTokens > QUALITY_MODE_TOKENS ? GPTMode.FAST : GPTMode.QUALITY;

  const maxTokens = ensureIRunThisInRange({
    prompt: fullPrompt,
    mode: mode,
    preferedTokens: fullPromptTokens,
    minTokens: minTokens,
  });

  const improveFixCallFunction = async () => {
    const { result, cost } = await gptExecute({
      fullPrompt,
      maxTokens,
      mode: GPTMode.QUALITY,
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
