import { FitnessAndNextSolutionsFunction, SolutionWithMeta } from '../src/strategies/stepEvolve/FitnessFunction';
import { stepEvolve } from '../src/strategies/stepEvolve/stepEvolve';
import { createSolutionWithMetaWithFitness } from '../src/strategies/stepEvolve/createSolutionWithMetaWithFitness';
import { createSolutionsFromFixes } from '../src/strategies/stepEvolve/createSolutionsFromFixes';

const RANGE_SEEK_START = 0;
const RANGE_SEEK_END = 10000;
const ITERATIONS = 10000;
const MAX_STALE_ITERATIONS = 100;
const THRESHOLD = -0.000932;

type TaskDefinition = {
  avoidThoseNumbers: number[];
};

type Solution = number;

function createFitnessAndNextSolutionsFunction(
  task: TaskDefinition,
): FitnessAndNextSolutionsFunction<Solution> {
  let fitnessAndNextSolutionsFunction = async (solutionWithMeta: SolutionWithMeta<Solution>) => {
    let fitness = task.avoidThoseNumbers.reduce((fitness, avoidThisNumber) => {
      return fitness - 1 / (0.1 + Math.abs(solutionWithMeta.solution - avoidThisNumber));
    }, 0);

    return {
      fitness,
      nextPossibleSolutions: async (): Promise<SolutionWithMeta<Solution>[]> => {
        let fixes = [
          async function randomFix(solution: number) {
            return (
              Math.random() * (RANGE_SEEK_END - RANGE_SEEK_START) +
              RANGE_SEEK_START
            );
          },
  
          async function moveUp(solution: number) {
            return Math.min(RANGE_SEEK_END, solution + Math.pow(100, 1 - (Math.random() * 5)));
          },
  
          async function moveDown(solution: number) {
            return Math.max(RANGE_SEEK_START, solution - Math.pow(100, 1 - (Math.random() * 5)));
          },
        ];

        return createSolutionsFromFixes({ solutionWithMeta, fitnessAndNextSolutionsFunction, fixes, maxBranching: 1 });
      }
    }
  };

  return fitnessAndNextSolutionsFunction;
}

(async () => {
  stepEvolve({
    initialSolution: await createSolutionWithMetaWithFitness(
      {
        solution: Math.random() * (RANGE_SEEK_END - RANGE_SEEK_START) + RANGE_SEEK_START,
        createdWith: 'initial',
        parent: undefined,
        fitnessAndNextSolutionsFunction: createFitnessAndNextSolutionsFunction({ avoidThoseNumbers: [0, 5000, 10000] })
      },
    ),
    threshold: THRESHOLD,
    maxNumIterations: ITERATIONS,
    maxStaleIterations: MAX_STALE_ITERATIONS,
    observers: [
      {
        onInitialSolution: async (solutionWithMeta, iteration) => {
          console.log('Initial solution is: ' + solutionWithMeta.solution + '.');
        },
        onAccept: async (
          oldSolutionWithMeta,
          acceptedSolutionWithMeta,
          iteration,
        ) => {
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
          console.log('Final solution is: ' + solutionWithMeta.solution + '.');
        },
      },
    ],
  }).then((solutionWithMeta) => {
    console.log('Solution is: ' + solutionWithMeta.solution + '.');
  });
})();

