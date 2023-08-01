import { z } from 'zod';
import { createFullPromptFromSections } from '../../src/gpt/createFullPromptFromSections';
import { gptExecute } from '../../src/gpt/gptExecute';
import { GPTMode } from '../../src/gpt/types';
import { SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { shuffleArray } from '../../src/utils/random/shuffleArray';
import { TaskDefinition } from './TaskDefinition';
import { createNewSolutionFix } from './fixCreateNewSolution';
import { improveSolutionFix } from './fixImproveSolution';
import { criteriaDefinition } from './criteriaDefinition';
import { getRandomElement } from '../../src/utils/random/getRandomElement';

export async function createFixesForSolution(task: TaskDefinition, solutionWithMeta: SolutionWithMeta<string>) {
  const result = await gptExecute({
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
        CRITERIA: shuffleArray(criteriaDefinition.slice())
          .map((c) => `${c.name} - Max of ${c.maxPoints}pts if ${c.maxPointsIf}`)
          .join('\n'),
      },
    }),
    maxTokens: 500,
    mode: GPTMode.FAST,
    outputName: 'suggestions',
    outputSchema: z
      .object({
        suggestions: z.array(z.string().describe('Suggestion to the user, what should be improved in order to maximize criteria.')).describe('Suggestions'),
      })
      .describe('Suggestions'),
  });

  const fixes = [
    createNewSolutionFix(task),
    ...result.result.suggestions.map((s) => improveSolutionFix({ task, solutionWithMeta, suggestions: s })),
    improveSolutionFix({ task, solutionWithMeta, suggestions: result.result.suggestions.join('\n') }),
  ];

  return fixes;
}
