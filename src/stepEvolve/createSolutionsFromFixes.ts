import { FitnessAndNextSolutionsFunction, Fix, SolutionWithMeta } from './FitnessFunction';
import { shuffleArray } from '../utils/random/shuffleArray';
import { createSolutionWithMetaWithFitness } from './createSolutionWithMetaWithFitness';

export async function createSolutionsFromFixes<S>({
  solutionWithMeta,
  fitnessAndNextSolutionsFunction,
  fixes,
  maxBranching = 3,
}: {
  solutionWithMeta: SolutionWithMeta<S>;
  fitnessAndNextSolutionsFunction: FitnessAndNextSolutionsFunction<S>;
  fixes: Fix<S>[];
  maxBranching?: number;
}): Promise<SolutionWithMeta<S>[]> {
  const workingFixes = fixes.slice();

  shuffleArray(workingFixes);

  const nextPossibleSolutions: SolutionWithMeta<S>[] = await Promise.all(
    workingFixes.slice(0, maxBranching).map(async (fix) => {
      return createSolutionWithMetaWithFitness({
        solution: await fix.call(),
        createdWith: fix.name,
        parent: solutionWithMeta,
        fitnessAndNextSolutionsFunction,
      });
    }),
  );

  return nextPossibleSolutions;
}
