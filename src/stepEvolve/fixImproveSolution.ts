import { z } from 'zod';
import { MinionTask } from '../minionTasks/MinionTask';
import { SolutionWithMeta } from './FitnessFunction';
import { gptExecute } from '../gpt/gptExecute';
import { createFullPromptFromSections } from '../gpt/createFullPromptFromSections';
import { GPTMode } from '../gpt/types';
import { countTokens } from '../gpt/countTokens';
import { MinionTaskSolution } from '../minionTasks/advancedCodeChangeStrategy';

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
  const { modificationDescription, userQuery } = task;

  const fullPrompt = createFullPromptFromSections({
    intro:
      'Improve the following SOLUTION that fullfill USER_QUERY request based on MODIFICATION_DESCRIPTION, use SUGGESTIONS as guidance. Do not output any section markers or additional sections in your response, just the new improved solution.',
    sections: {
      MODIFICATION_DESCRIPTION: modificationDescription,
      USER_QUERY: userQuery,
      SOLUTION: solutionWithMeta.solution.resultingCode,
      SUGGESTIONS: suggestions,
      'YOUR PROPOSED NEW SOLUTION': '',
    },
  });
  const maxTokens = countTokens(fullPrompt, GPTMode.QUALITY);

  const improveFixCallFunction = async () => {
    const { result, cost } = await gptExecute({
      fullPrompt,
      maxTokens,
      mode: GPTMode.QUALITY,
      outputSchema: z.string(),
    });
    task.totalCost += cost;

    return result;
  };

  return {
    name: `Improve solution (${suggestions.replace(/\n/g, ',')})`,
    call: improveFixCallFunction,
  };
}
