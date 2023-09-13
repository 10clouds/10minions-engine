import { type SolutionWithMeta } from './FitnessFunction';
import { FitnessObserver } from './FitnessObserver';

//TODO: Implement this class

/**
 * This observer checks the consistency of state while evolving the solutions using stepEvolve.
 * It checks whenever the object changed and if the fitness is still the same.
 */
export class ConsistencyObserver<S> implements FitnessObserver<S> {
  currentSolutionWithMeta: SolutionWithMeta<S> | undefined;
  currentConsistencyCheckString: string | undefined;

  onInitialSolution?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onProgressMade?: (
    oldSolutionsWithMeta: SolutionWithMeta<S>[],
    accepted: SolutionWithMeta<S>[],
    rejected: SolutionWithMeta<S>[],
    newSolutions: SolutionWithMeta<S>[],
    iteration: number,
  ) => Promise<void>;
  onFinalSolution?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
}
