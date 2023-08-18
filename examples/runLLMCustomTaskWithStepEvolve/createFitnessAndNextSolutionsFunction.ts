import { FitnessAndNextSolutionsFunction, SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { createSolutionsFromFixes } from '../../src/stepEvolve/createSolutionsFromFixes';
import { TaskDefinition } from './TaskDefinition';
import { createFixesForSolution } from './createFixesForSolution';
import { criteriaDefinition } from './criteriaDefinition';
import { rateSolution } from './rateSolution';

export function createFitnessAndNextSolutionsFunction({
  task,
  maxBranching,
}: {
  task: TaskDefinition;
  maxBranching: number;
}): FitnessAndNextSolutionsFunction<string> {
  const fitnessAndNextSolutionsFunction = async (solutionWithMeta: SolutionWithMeta<string>) => {
    const { finalRating, criteriaRatings } = await rateSolution(task, solutionWithMeta);

    const criteriaWithRatings = criteriaDefinition.map((c) => {
      const criteriaRating = criteriaRatings.find((cr) => cr.criteria === c.name);
      return {
        ...c,
        rating: criteriaRating?.rating ?? 0,
        reasoning: criteriaRating?.reasoning ?? '',
      };
    });

    return {
      totalFitness: finalRating,
      fitnessComponents: criteriaWithRatings.map((c) => {
        return { id: c.name, fitness: c.rating };
      }),
      nextPossibleSolutions: async (): Promise<SolutionWithMeta<string>[]> => {
        const fixes = await createFixesForSolution(task, solutionWithMeta, criteriaWithRatings);

        return createSolutionsFromFixes({
          solutionWithMeta,
          fitnessAndNextSolutionsFunction,
          fixes,
          maxBranching,
        });
      },
    };
  };

  return fitnessAndNextSolutionsFunction;
}
