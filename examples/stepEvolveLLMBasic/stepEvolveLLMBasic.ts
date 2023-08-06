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
const ITERATIONS = 50;
const MAX_STALE_ITERATIONS = 3;
const THRESHOLD = 120;
const BRANCHING = 1;

(async function () {
  console.log(INTRO);

  initCLISystems();

  const initialSolutions = [];
  for (let i = 0; i < 10; i++) {
    initialSolutions.push(
      await createSolutionWithMetaWithFitness({
        solution: await createNewSolutionFix({ task: TASK })(),
        createdWith: 'initial1',
        parent: undefined,
        fitnessAndNextSolutionsFunction: createFitnessAndNextSolutionsFunction({ task: { task: TASK }, maxBranching: BRANCHING }),
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
            console.log('Initial solution is: ' + solutionWithMeta.solution + ' ' + solutionWithMeta.fitness + ' (' + solutionWithMeta.createdWith + ')' + '.');
          }
        },
        onAccept: async (oldSolutionsWithMeta, solutionWithMeta, iteration) => {
          console.log(
            'New best ' + iteration + ': ' + solutionWithMeta.solution + ' ' + solutionWithMeta.fitness + ' (' + solutionWithMeta.createdWith + ')' + '.',
          );
        },
        onReject: async (oldSolutionsWithMeta, solutionWithMeta, iteration) => {
          console.log(
            'Rejected ' + iteration + ': ' + solutionWithMeta.solution + ' ' + solutionWithMeta.fitness + ' (' + solutionWithMeta.createdWith + ')' + '.',
          );
        },
        onProgressMade: async (oldSolutionsWithMeta, iteration) => {
          console.log('Solutions', oldSolutionsWithMeta.map((s) => s.solution).join(', '));
        },
        onFinalSolution: async (solutionWithMeta, iteration) => {
          const { fitness, solution, iteration: solutionIteration } = solutionWithMeta;

          console.log('Final solution is:');
          console.log('```');
          console.log(solution);
          console.log('```');
          console.log('Fitness: ' + fitness);
          console.log('Iteration: ' + iteration + ' (Best solution found in iteration: ' + solutionIteration + ')');
        },
      },
    ],
  });
})();
