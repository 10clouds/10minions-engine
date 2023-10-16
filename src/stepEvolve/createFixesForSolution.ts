import { z } from 'zod';

import { CriteriaRatings, MAX_POINTS } from '../../score/rateMinionTask';
import { gptExecute } from '../../src/gpt/gptExecute';
import { GPTMode } from '../../src/gpt/types';
import { Fix, SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { getRandomElement } from '../../src/utils/random/getRandomElement';
import { shuffleArray } from '../../src/utils/random/shuffleArray';
import { countTokens } from '../gpt/utils/countTokens';
import { createFullPromptFromSections } from '../gpt/utils/createFullPromptFromSections';
import { MinionTask } from '../minionTasks/MinionTask';
import { MinionTaskSolution } from '../minionTasks/types';
import {
  improveSolutionFix,
  ImproveSolutionFixResult,
} from './fixImproveSolution';

export async function createFixesForSolution(
  task: MinionTask,
  solutionWithMeta: SolutionWithMeta<MinionTaskSolution>,
  criteriaWithRatings: CriteriaRatings[],
): Promise<Fix<MinionTaskSolution>[]> {
  let averageCriteriaRating = 0;
  if (criteriaWithRatings.length > 0) {
    averageCriteriaRating =
      criteriaWithRatings.map((c) => c.rating).reduce((a, b) => a + b, 0) /
      criteriaWithRatings.length;
  }
  const resultingCode = solutionWithMeta.solution.resultingCode;
  const criteriaWithBelowAverageRating = criteriaWithRatings.filter(
    (c) => c.rating <= averageCriteriaRating,
  );
  const { modificationDescription, userQuery } = task;

  const fullPrompt = createFullPromptFromSections({
    intro: `You are a ${getRandomElement([
      'brilliant software engineer with a high IQ, specializing in compiler optimization to enhance code efficiency',
      'data scientist of exceptional intelligence, focused on developing advanced machine learning algorithms for code improvement suggestions',
      'ingenious systems architect possessing a high IQ, dedicated to optimizing code for scalability and peak performance',
      'sharp-minded security researcher with a high IQ, adept at identifying and rectifying code vulnerabilities for enhanced code quality',
    ])}. provide suggestions on how to improve the SOLUTION that full fill USER_QUERY request based on MODIFICATION_DESCRIPTION in order to maximize the judging CRITERIA.`,
    sections: {
      MODIFICATION_DESCRIPTION: modificationDescription,
      USER_QUERY: userQuery,
      SOLUTION: resultingCode,
      CRITERIA: shuffleArray(criteriaWithBelowAverageRating.slice())
        .map(
          ({ criteria }) =>
            `Max of ${MAX_POINTS}pts if the SOLUTION passes this test: '${criteria}'`,
        )
        .join('\n'),
    },
  });
  const maxTokens = countTokens(fullPrompt, GPTMode.FAST);
  const gptResult = await gptExecute({
    fullPrompt,
    maxTokens,
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
  });

  const result =
    criteriaWithBelowAverageRating.length > 0
      ? gptResult
      : { result: { suggestions: [], cost: 0 } };

  const allSuggestions = [...result.result.suggestions];
  task.totalCost += gptResult.cost;
  console.log('allSuggestions', allSuggestions);
  // TODO: add maintain suggestions
  // TODO: add createNewSolutionFix
  const fixes = [
    ...allSuggestions.map((suggestions) =>
      improveSolutionFix({ task, solutionWithMeta, suggestions }),
    ),
    ...Array<ImproveSolutionFixResult>(3).fill(
      improveSolutionFix({
        task,
        solutionWithMeta,
        suggestions: [...allSuggestions].join('\n'),
      }),
    ),
  ];

  return fixes;
}
