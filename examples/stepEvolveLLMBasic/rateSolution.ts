import { z } from 'zod';
import { createFullPromptFromSections } from '../../src/gpt/createFullPromptFromSections';
import { gptExecute } from '../../src/gpt/gptExecute';
import { GPTMode } from '../../src/gpt/types';
import { SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { shuffleArray } from '../../src/utils/random/shuffleArray';
import { sum } from '../../src/utils/utils';
import { TaskDefinition } from './TaskDefinition';
import { criteriaDefinition } from './criteriaDefinition';

export async function rateSolution(task: TaskDefinition, solutionWithMeta: SolutionWithMeta<string>) {
  const rawResult = await gptExecute({
    fullPrompt: createFullPromptFromSections({
      intro: 'Rate how good is the following SOLUTION to the PROBLEM described below.',
      sections: {
        PROBLEM: task.task,
        SOLUTION: solutionWithMeta.solution,
        CRITERIA: shuffleArray(criteriaDefinition.slice())
          .map((c) => `${c.name} - Max of ${c.maxPoints}pts if ${c.maxPointsIf}`)
          .join('\n'),
      },
    }),
    maxTokens: 500,
    mode: GPTMode.FAST,
    outputName: 'rating',
    outputSchema: z
      .object({
        criteria: z
          .array(
            z.object({
              criteria: z.string().describe('Name of the criteria'),
              reasoning: z.string().describe('Reasoning for the rating on this criteria'),
              rating: z.number().describe('Rating for the criteria'),
            })
          )
          .describe('Components of the final rating, from the CRITERIA section'),
      })
      .describe('Rating of the solution'),
  });

  console.log(rawResult.result);

  const criteria = rawResult.result.criteria;
  const finalRating = sum(criteria.map((c) => c.rating as number));
  return finalRating;
}
