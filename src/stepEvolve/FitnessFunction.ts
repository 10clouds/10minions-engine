/**
 * FitnessAndNextResult represents a structure that contains
 * fitness score and a function that returns an array of
 * next possible solutions.
 */
export type FitnessAndNextSolutionsResult<S> = {
  totalFitness: number;
  fitnessComponents: { id: string; fitness: number }[];
  nextPossibleSolutions: () => Promise<SolutionWithMeta<S>[]>;
};

/**
 * FitnessAndNextFunction represents a function that
 * takes a solution and returns its fitness score
 * and next possible solutions as a promise.
 */
export type FitnessAndNextSolutionsFunction<S> = (
  solution: SolutionWithMeta<S>,
) => Promise<FitnessAndNextSolutionsResult<S>>;

/**
 * SolutionWithMeta represents a solution with its metadata,
 * contains information regarding fitness score,
 * next possible solutions, parent solution and etc.
 */
export type SolutionWithMeta<S> = FitnessAndNextSolutionsResult<S> & {
  solution: S;
  parent: SolutionWithMeta<S> | undefined;
  createdWith: string;
  iteration: number;
};

/**
 * Fix represents a function that supposed to improve a given solution.
 * It returns a promise of a new improved solution.
 * If the fix is not applicable, it returns the same solution.
 */
export type Fix<T> = {
  name: string;
  call: () => Promise<T>;
};
