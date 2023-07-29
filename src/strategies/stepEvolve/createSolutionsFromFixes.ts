import { FitnessAndNextSolutionsFunction, Fix, SolutionWithMeta } from './FitnessFunction';
import { shuffleArray } from '../utils/utils';
import { createSolutionWithMetaWithFitness } from './createSolutionWithMetaWithFitness';

export async function createSolutionsFromFixes<S>({ solutionWithMeta, fitnessAndNextSolutionsFunction, fixes, maxBranching: maxCount = 3 }: { solutionWithMeta: SolutionWithMeta<S>; fitnessAndNextSolutionsFunction: FitnessAndNextSolutionsFunction<S>; fixes: Fix<S>[]; maxBranching?: number; }): Promise<SolutionWithMeta<S>[]> {
  let workingFixes = fixes.slice();

  shuffleArray(workingFixes);

  let nextPossibleSolutions: SolutionWithMeta<S>[] = await Promise.all(workingFixes.slice(0, maxCount).map(async (fix) => {
    return createSolutionWithMetaWithFitness(
      {
        solution: await fix(solutionWithMeta.solution),
        createdWith: fix.name,
        parent: solutionWithMeta,
        fitnessAndNextSolutionsFunction
      }
    );
  }));

  return nextPossibleSolutions;
}
