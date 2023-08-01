import { initCLISystems } from '../../src/CLI/setupCLISystems';
import { createSolutionWithMetaWithFitness } from '../../src/stepEvolve/createSolutionWithMetaWithFitness';
import { stepEvolve } from '../../src/stepEvolve/stepEvolve';
import { createFitnessAndNextSolutionsFunction } from './createFitnessAndNextSolutionsFunction';
import { createNewSolutionFix } from './fixCreateNewSolution';

const INTRO = `
This example uses LLMs to write and improve on a linkedin post that meets given criteria.
`;

const TASK =
  'Create a world class best official annoucement on linkedin by the CEO of 10Clouds that announces 10Clouds AI Labs. Output only post text, do not add any section markers or additional sections in your response.';
const ITERATIONS = 10;
const MAX_STALE_ITERATIONS = 3;
const THRESHOLD = 120;
export const BRANCHING = 3;

(async function () {
  console.log(INTRO);

  initCLISystems();

  stepEvolve({
    initialSolution: await createSolutionWithMetaWithFitness({
      solution: await createNewSolutionFix({ task: TASK })(),
      createdWith: 'initial',
      parent: undefined,
      fitnessAndNextSolutionsFunction: createFitnessAndNextSolutionsFunction({ task: TASK }),
    }),
    threshold: THRESHOLD,
    maxNumIterations: ITERATIONS,
    maxStaleIterations: MAX_STALE_ITERATIONS,
    observers: [
      {
        onInitialSolution: async (solutionWithMeta, iteration) => {
          console.log('Initial solution is: ' + solutionWithMeta.solution + '.');
        },
        onAccept: async (oldSolutionWithMeta, solutionWithMeta, iteration) => {
          console.log(
            'New best ' + iteration + ': ' + solutionWithMeta.solution + ' ' + solutionWithMeta.fitness + ' (' + solutionWithMeta.createdWith + ')' + '.',
          );
        },
        onFinalSolution: async (solutionWithMeta, iteration) => {
          console.log('Final solution is:');
          console.log('```');
          console.log(solutionWithMeta.solution);
          console.log('```');
          console.log('Fitness: ' + solutionWithMeta.fitness);
          console.log('Iteration: ' + iteration + ' (Best solution found in iteration: ' + solutionWithMeta.iteration + ')');
        },
      },
    ],
  });
})();
