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
      totalFitness: fitness,
      fitnessComponents: [{ id: 'fitness', fitness: fitness }],
      nextPossibleSolutions: async (): Promise<SolutionWithMeta<Solution>[]> => {
        const fixes = [
          {
            name: 'Random fix',
            call: async () => {
              return Math.random() * (RANGE_SEEK_END - RANGE_SEEK_START) + RANGE_SEEK_START;
            },
          },
          {
            name: 'Move up',
            call: async () => {
              return Math.min(RANGE_SEEK_END, solutionWithMeta.solution + Math.pow(100, 1 - Math.random() * 5));
            },
          },
          {
            name: 'Move down',
            call: async () => {
              return Math.max(RANGE_SEEK_START, solutionWithMeta.solution - Math.pow(100, 1 - Math.random() * 5));
            },
          },
        ];

        return createSolutionsFromFixes({ solutionWithMeta, fitnessAndNextSolutionsFunction, fixes, maxBranching: 1 });
      },
    };
  };

  return fitnessAndNextSolutionsFunction;
}
