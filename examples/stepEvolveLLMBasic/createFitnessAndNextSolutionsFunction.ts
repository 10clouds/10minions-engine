import { FitnessAndNextSolutionsFunction, SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { createSolutionsFromFixes } from '../../src/stepEvolve/createSolutionsFromFixes';
import { TaskDefinition } from './TaskDefinition';
import { createFixesForSolution } from './createFixesForSolution';
import { rateSolution } from './rateSolution';

export function createFitnessAndNextSolutionsFunction({
  task,
  maxBranching,
}: {
  task: TaskDefinition;
  maxBranching: number;
}): FitnessAndNextSolutionsFunction<string> {
  const fitnessAndNextSolutionsFunction = async (solutionWithMeta: SolutionWithMeta<string>) => {
    return {
      fitness: await rateSolution(task, solutionWithMeta),
      nextPossibleSolutions: async (): Promise<SolutionWithMeta<string>[]> => {
        const fixes = await createFixesForSolution(task, solutionWithMeta);

        return createSolutionsFromFixes({
          solutionWithMeta,
          fitnessAndNextSolutionsFunction,
          fixes,
          maxBranching,
        });
      },
    };
  };

  return fitnessAndNextSolutionsFunction;
}
