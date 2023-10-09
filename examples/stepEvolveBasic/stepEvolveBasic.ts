import { createSolutionWithMetaWithFitness } from '../../src/stepEvolve/createSolutionWithMetaWithFitness';
import { stepEvolve } from '../../src/stepEvolve/stepEvolve';
import {
  createFitnessAndNextSolutionsFunction,
  RANGE_SEEK_END,
  RANGE_SEEK_START,
} from './createFitnessAndNextSolutionsFunction';

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

  const initialSolutions = [];
  for (let i = 0; i < 10; i++) {
    const solution =
      Math.random() * (RANGE_SEEK_END - RANGE_SEEK_START) + RANGE_SEEK_START;
    initialSolutions.push(
      await createSolutionWithMetaWithFitness({
        solution,
        createdWith: 'initial',
        parent: undefined,
        fitnessAndNextSolutionsFunction: createFitnessAndNextSolutionsFunction({
          avoidThoseNumbers: [0, 5000, 10000],
        }),
      }),
    );
  }

  stepEvolve({
    initialSolutions,
    threshold: THRESHOLD,
    maxNumIterations: ITERATIONS,
    maxStaleIterations: MAX_STALE_ITERATIONS,
    observers: [
      {
        onInitialSolutions: async (solutionsWithMeta, iteration) => {
          for (const solutionWithMeta of solutionsWithMeta) {
            console.log(`Initial solution is: ${solutionWithMeta.solution}.`);
          }
        },
        async onProgressMade(
          oldSolutionsWithMeta,
          accepted,
          rejected,
          newSolutions,
          iteration,
        ) {
          for (const accepted1 of accepted) {
            console.log(oldSolutionsWithMeta.map((s) => s.solution).join(', '));

            const { solution, totalFitness, createdWith } = accepted1;
            console.log(
              `New best ${iteration}: ${solution} ${totalFitness} (${createdWith})` +
                `.`,
            );
          }
        },
        onFinalSolution: async (solutionWithMeta, iteration) => {
          console.log(`The final solution is: ${solutionWithMeta.solution}.`);
        },
      },
    ],
  });
})();
