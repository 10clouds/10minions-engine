import { SolutionWithMeta } from './FitnessFunction';

export type FitnessObserver<S> = {
  onInitialSolutions?: (
    solutionsWithMeta: SolutionWithMeta<S>[],
    iteration: number,
  ) => Promise<void>;
  onProgressMade?: (
    oldSolutionsWithMeta: SolutionWithMeta<S>[],
    accepted: SolutionWithMeta<S>[],
    rejected: SolutionWithMeta<S>[],
    newSolutions: SolutionWithMeta<S>[],
    iteration: number,
  ) => Promise<void>;
  onFinalSolution?: (
    solutionWithMeta: SolutionWithMeta<S>,
    iteration: number,
  ) => Promise<void>;
};
