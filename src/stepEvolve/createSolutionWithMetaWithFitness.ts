import {
  FitnessAndNextSolutionsFunction,
  SolutionWithMeta,
} from './FitnessFunction';

export async function createSolutionWithMetaWithFitness<S>({
  solution,
  createdWith,
  parent,
  fitnessAndNextSolutionsFunction,
}: {
  solution: S;
  createdWith: string;
  parent?: SolutionWithMeta<S>;
  fitnessAndNextSolutionsFunction: FitnessAndNextSolutionsFunction<S>;
}): Promise<SolutionWithMeta<S>> {
  console.log('Creating solution with meta with fitness...');

  const solutionWithMeta: SolutionWithMeta<S> = {
    solution,
    parent,
    createdWith,
    iteration: 0,
    totalFitness: 0,
    fitnessComponents: [],
    nextPossibleSolutions: async () => [],
  };

  const result = await fitnessAndNextSolutionsFunction(solutionWithMeta);

  solutionWithMeta.totalFitness = result.totalFitness;
  solutionWithMeta.fitnessComponents = result.fitnessComponents;
  solutionWithMeta.nextPossibleSolutions = result.nextPossibleSolutions;

  return solutionWithMeta;
}
