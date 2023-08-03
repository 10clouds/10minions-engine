import { SolutionWithMeta } from './FitnessFunction';

export type FitnessObserver<S> = {
  onInitialSolutions?: (solutionsWithMeta: SolutionWithMeta<S>[], iteration: number) => Promise<void>;
  onAccept?: (oldSolutionsWithMeta: SolutionWithMeta<S>[], acceptedSolutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onReject?: (currentSolutionsWithMeta: SolutionWithMeta<S>[], rejectedSolutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onProgressMade?: (solutionsWithMeta: SolutionWithMeta<S>[], iteration: number) => Promise<void>;
  onFinalSolution?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
};
