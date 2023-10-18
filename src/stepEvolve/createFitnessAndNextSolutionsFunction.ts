import { rateMinionTask } from '../../score/rateMinionTask';
import { ScoreTestType } from '../../score/types';
import { createSolutionsFromFixes } from '../../src/stepEvolve/createSolutionsFromFixes';
import {
  FitnessAndNextSolutionsFunction,
  SolutionWithMeta,
} from '../../src/stepEvolve/FitnessFunction';
import { MinionTask } from '../minionTasks/MinionTask';
import { MinionTaskSolution } from '../minionTasks/types';
import { createFixesForSolution } from './createFixesForSolution';

export function createFitnessAndNextSolutionsFunction({
  task,
  maxBranching,
  criteriaDefinition,
}: {
  task: MinionTask;
  maxBranching: number;
  criteriaDefinition?: { items: ScoreTestType[] };
}): FitnessAndNextSolutionsFunction<MinionTaskSolution> {
  const fitnessAndNextSolutionsFunction = async (
    solutionWithMeta: SolutionWithMeta<MinionTaskSolution>,
  ) => {
    if (!criteriaDefinition) {
      throw new Error('Criteria definition is empty');
    }

    const resultingCode = solutionWithMeta.solution.resultingCode;
    const { finalRating, criteriaRatings } = await rateMinionTask(
      task,
      resultingCode,
      criteriaDefinition.items,
    );

    const nextPossibleSolutions = async (): Promise<
      SolutionWithMeta<MinionTaskSolution>[]
    > => {
      const fixes = await createFixesForSolution(
        task,
        solutionWithMeta,
        criteriaRatings,
      );

      return createSolutionsFromFixes({
        solutionWithMeta,
        fitnessAndNextSolutionsFunction,
        fixes,
        maxBranching,
      });
    };

    return {
      totalFitness: finalRating,
      fitnessComponents: criteriaRatings.map((c) => {
        return { id: c.criteria, fitness: c.rating };
      }),
      nextPossibleSolutions,
    };
  };

  return fitnessAndNextSolutionsFunction;
}
