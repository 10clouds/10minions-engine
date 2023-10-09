import { z } from 'zod';

import { createFullPromptFromSections } from '../../src/gpt/createFullPromptFromSections';
import { gptExecute } from '../../src/gpt/gptExecute';
import { GPTMode } from '../../src/gpt/types';
import { Fix, SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { getRandomElement } from '../../src/utils/random/getRandomElement';
import { shuffleArray } from '../../src/utils/random/shuffleArray';
import { Criterion } from './Criterion';
import { createNewSolutionFix } from './fixes/fixCreateNewSolution';
import { improveSolutionFix } from './fixes/fixImproveSolution';
import { TaskDefinition } from './TaskDefinition';

export async function createFixesForSolution(
  task: TaskDefinition,
  solutionWithMeta: SolutionWithMeta<string>,
  criteriaWithRatings: (Criterion<string> & {
    rating: number;
    reasoning: string;
  })[],
): Promise<Fix<string>[]> {
  let averageCriteriaRating = 0;
  if (criteriaWithRatings.length > 0) {
    averageCriteriaRating =
      criteriaWithRatings.map((c) => c.rating).reduce((a, b) => a + b, 0) /
      criteriaWithRatings.length;
  }

  const criteriaWithBelowAverageRating = criteriaWithRatings.filter(
    (c) => c.rating <= averageCriteriaRating,
  );
  const criteriaGPT = criteriaWithBelowAverageRating.filter(
    (c) => c.suggestions === 'GPT',
  );
  const criteriaCalculate = criteriaWithBelowAverageRating.filter(
    (c) => c.suggestions !== 'GPT',
  );

  const result =
    criteriaGPT.length > 0
      ? await gptExecute({
          fullPrompt: createFullPromptFromSections({
            intro: `You are a ${getRandomElement([
              'CEO',
              'Social Media Specialist',
              'PR Specialist',
              'LinkedIn specialist',
            ])}. provide suggestions on how to improve the SOLUTION in order to maximize the judging CRITERIA.`,
            sections: {
              PROBLEM: task.task,
              SOLUTION: solutionWithMeta.solution,
              CRITERIA: shuffleArray(criteriaGPT.slice())
                .map(
                  (c) =>
                    `${c.name} - Max of ${c.maxPoints}pts if ${c.maxPointsIf}`,
                )
                .join('\n'),
            },
          }),
          maxTokens: 500,
          mode: GPTMode.FAST,
          outputName: 'suggestions',
          outputSchema: z
            .object({
              suggestions: z
                .array(
                  z
                    .string()
                    .describe(
                      'Suggestion to the user, what should be improved in order to maximize criteria.',
                    ),
                )
                .describe('Suggestions'),
            })
            .describe('Suggestions'),
        })
      : { result: { suggestions: [] } };

  const criteriaWithAboveAverageRating = criteriaWithRatings.filter(
    (c) => c.rating > averageCriteriaRating,
  );
  const allSuggestions = [
    ...result.result.suggestions,
    ...criteriaCalculate
      .map((c) =>
        c.suggestions !== 'GPT' ? c.suggestions(solutionWithMeta.solution) : [],
      )
      .flat(),
  ];

  console.log('allSuggestions', allSuggestions);

  const fixes = [
    createNewSolutionFix(task),
    ...allSuggestions.map((suggestions) =>
      improveSolutionFix({
        task,
        solutionWithMeta,
        suggestions: [
          suggestions,
          ...criteriaWithAboveAverageRating.map((c) => c.maintain),
        ].join('\n'),
      }),
    ),
    ...(Array(3).fill(
      improveSolutionFix({
        task,
        solutionWithMeta,
        suggestions: [
          ...allSuggestions,
          ...criteriaWithAboveAverageRating.map((c) => c.maintain),
        ].join('\n'),
      }),
    ) as Fix<string>[]),
  ];

  return fixes;
}
