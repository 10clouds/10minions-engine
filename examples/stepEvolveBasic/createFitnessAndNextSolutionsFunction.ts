import { FitnessAndNextSolutionsFunction, SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { createSolutionsFromFixes } from '../../src/stepEvolve/createSolutionsFromFixes';

export type TaskDefinition = {
  avoidThoseNumbers: number[];
};

export type Solution = number;

export const RANGE_SEEK_START = 0;
export const RANGE_SEEK_END = 10000;

export function createFitnessAndNextSolutionsFunction(task: TaskDefinition): FitnessAndNextSolutionsFunction<Solution> {
  const fitnessAndNextSolutionsFunction = async (solutionWithMeta: SolutionWithMeta<Solution>) => {
    const fitness = task.avoidThoseNumbers.reduce((fitness, avoidThisNumber) => {
      return fitness - 1 / (0.1 + Math.abs(solutionWithMeta.solution - avoidThisNumber));
    }, 0);

    return {
      fitness,
      nextPossibleSolutions: async (): Promise<SolutionWithMeta<Solution>[]> => {
        const fixes = [
          async function randomFix(solution: number) {
            return Math.random() * (RANGE_SEEK_END - RANGE_SEEK_START) + RANGE_SEEK_START;
          },

          async function moveUp(solution: number) {
            return Math.min(RANGE_SEEK_END, solution + Math.pow(100, 1 - Math.random() * 5));
          },

          async function moveDown(solution: number) {
            return Math.max(RANGE_SEEK_START, solution - Math.pow(100, 1 - Math.random() * 5));
          },
        ];

        return createSolutionsFromFixes({ solutionWithMeta, fitnessAndNextSolutionsFunction, fixes, maxBranching: 1 });
      },
    };
  };

  return fitnessAndNextSolutionsFunction;
}
