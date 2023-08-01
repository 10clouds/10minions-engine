import { FitnessAndNextSolutionsFunction, SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { stepEvolve } from '../../src/stepEvolve/stepEvolve';
import { createSolutionWithMetaWithFitness } from '../../src/stepEvolve/createSolutionWithMetaWithFitness';
import { createSolutionsFromFixes } from '../../src/stepEvolve/createSolutionsFromFixes';

const INTRO = `
This example searches for a maximum of a example function.
Domain of this search is 0 to 10000
There are two maximums of the example function: one around 2431 and one around 7568.
`;

const RANGE_SEEK_START = 0;
const RANGE_SEEK_END = 10000;
const ITERATIONS = 10000;
const MAX_STALE_ITERATIONS = 100;
const THRESHOLD = -0.000932;

type TaskDefinition = {
  avoidThoseNumbers: number[];
};

type Solution = number;

function createFitnessAndNextSolutionsFunction(task: TaskDefinition): FitnessAndNextSolutionsFunction<Solution> {
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

(async () => {
  console.log(INTRO);

  stepEvolve({
    initialSolution: await createSolutionWithMetaWithFitness({
      solution: Math.random() * (RANGE_SEEK_END - RANGE_SEEK_START) + RANGE_SEEK_START,
      createdWith: 'initial',
      parent: undefined,
      fitnessAndNextSolutionsFunction: createFitnessAndNextSolutionsFunction({ avoidThoseNumbers: [0, 5000, 10000] }),
    }),
    threshold: THRESHOLD,
    maxNumIterations: ITERATIONS,
    maxStaleIterations: MAX_STALE_ITERATIONS,
    observers: [
      {
        onInitialSolution: async (solutionWithMeta, iteration) => {
          console.log('Initial solution is: ' + solutionWithMeta.solution + '.');
        },
        onAccept: async (oldSolutionWithMeta, acceptedSolutionWithMeta, iteration) => {
          console.log(
            'New best ' +
              iteration +
              ': ' +
              acceptedSolutionWithMeta.solution +
              ' ' +
              acceptedSolutionWithMeta.fitness +
              ' (' +
              acceptedSolutionWithMeta.createdWith +
              ')' +
              '.',
          );
        },
        onFinalSolution: async (solutionWithMeta, iteration) => {
          console.log('The final solution is: ' + solutionWithMeta.solution + '.');
        },
      },
    ],
  });
})();
