import { z } from 'zod';
import { createFullPromptFromSections } from '../../../src/gpt/createFullPromptFromSections';
import { gptExecute } from '../../../src/gpt/gptExecute';
import { GPTMode } from '../../../src/gpt/types';
import { SolutionWithMeta } from '../../../src/stepEvolve/FitnessFunction';
import { TaskDefinition } from '../TaskDefinition';

export function improveSolutionFix({
  task,
  solutionWithMeta,
  suggestions,
}: {
  task: TaskDefinition;
  solutionWithMeta: SolutionWithMeta<string>;
  suggestions: string;
}) {
  return {
    name: `Improve solution (${suggestions.replace(/\n/g, ',')})`,
    call: async () => {
      return (
        await gptExecute({
          fullPrompt: createFullPromptFromSections({
            intro:
              'Improve the following SOLUTION to the PROBLEM described below, use SUGGESTIONS as guidance. Do not output any section markers or additional sections in your response, just the new improved solution.',
            sections: { PROBLEM: task.task, SOLUTION: solutionWithMeta.solution, SUGGESTIONS: suggestions, 'YOUR PROPOSED NEW SOLUTION': '' },
          }),
          maxTokens: 500,
          mode: GPTMode.QUALITY,
          outputSchema: z.string(),
        })
      ).result;
    },
  };
}
