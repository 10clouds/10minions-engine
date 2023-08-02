import { stepEvolve } from '../../src/stepEvolve/stepEvolve';
import { createSolutionWithMetaWithFitness } from '../../src/stepEvolve/createSolutionWithMetaWithFitness';
import { RANGE_SEEK_END, RANGE_SEEK_START, createFitnessAndNextSolutionsFunction } from './createFitnessAndNextSolutionsFunction';

const INTRO = `
This example searches for a maximum of a example function.
Domain of this search is ${RANGE_SEEK_START} to ${RANGE_SEEK_END}
There are two maximums of the example function: one around 2431 and one around 7568.
`;

const ITERATIONS = 10000;
const MAX_STALE_ITERATIONS = 100;
const THRESHOLD = -0.000932;

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