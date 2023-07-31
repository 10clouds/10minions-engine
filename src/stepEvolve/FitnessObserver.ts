import { SolutionWithMeta } from './FitnessFunction';

export type FitnessObserver<S> = {
  onInitialSolution?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onAccept?: (oldSolutionWithMeta: SolutionWithMeta<S>, acceptedSolutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onReject?: (currentSolutionWithMeta: SolutionWithMeta<S>, rejectedSolutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onProgressMade?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onFinalSolution?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
};
