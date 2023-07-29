import { FitnessAndNextSolutionsFunction, SolutionWithMeta } from './FitnessFunction';

export async function createSolutionWithMetaWithFitness<S>({
  solution,
  createdWith,
  parent,
  fitnessAndNextSolutionsFunction,
}: {
  solution: S;
  createdWith: string;
  parent: SolutionWithMeta<S> | undefined;
  fitnessAndNextSolutionsFunction: FitnessAndNextSolutionsFunction<S>;
}): Promise<SolutionWithMeta<S>> {
  let solutionWithMeta: SolutionWithMeta<S> = {
    solution,
    parent,
    createdWith,
    iteration: 0,
    fitness: 0,
    nextPossibleSolutions: async () => [],
  };

  solutionWithMeta = {
    ...solutionWithMeta,
    ...(await fitnessAndNextSolutionsFunction(solutionWithMeta)),
  };

  return solutionWithMeta;
}
