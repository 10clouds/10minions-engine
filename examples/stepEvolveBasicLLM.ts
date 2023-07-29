import { initCLISystems } from '../src/CLI/setupCLISystems';

import { gptExecute } from '../src/openai';
import { FitnessAndNextSolutionsFunction, SolutionWithMeta } from '../src/strategies/stepEvolve/FitnessFunction';
import { createSolutionWithMetaWithFitness } from '../src/strategies/stepEvolve/createSolutionWithMetaWithFitness';
import { createSolutionsFromFixes } from '../src/strategies/stepEvolve/createSolutionsFromFixes';
import { stepEvolve } from '../src/strategies/stepEvolve/stepEvolve';
import { shuffleArray, sum } from '../src/strategies/utils/utils';
import { createFullPromptFromSections } from '../src/utils/createFullPromptFromSections';

const TASK = 'Create a world class best official annoucement on linkedin by the CEO of 10Clouds that announces 10Clouds AI Labs. Output only post text, do not add any section markers or additional sections in your response.';
const ITERATIONS = 10;
const THRESHOLD = 100;
const BRANCHING = 1;

type TaskDefinition = {
  task: string;
};

type Solution = string;

function createNewSolutionFix(problem: TaskDefinition) {
  return async function newSolution() {
    return (
      await gptExecute({
        fullPrompt: problem.task,
        maxTokens: 500,
        mode: 'FAST',
        outputType: 'string',
      })
    ).result;
  };
}

function improveSolutionFix({ task, solutionWithMeta, suggestions  }: { task: TaskDefinition; solutionWithMeta: SolutionWithMeta<Solution>; suggestions: string; }) {
  return async function improveSolution() {
    return (
      await gptExecute({
        fullPrompt: createFullPromptFromSections({
          intro: 'Improve the following SOLUTION to the PROBLEM described below, use SUGGESTIONS as guidance. Do not output any section markers or additional sections in your response, just the new improved solution.',
          sections: { PROBLEM: task.task, SOLUTION: solutionWithMeta.solution, SUGGESTIONS: suggestions, "YOUR PROPOSED NEW SOLUTION": "" },
        }),
        maxTokens: 500,
        mode: 'QUALITY',
        outputType: 'string',
      })
    ).result;
  };
}


type Criterion = {
  name: string;
  maxPointsIf: string;
  maxPoints: number;
}

function createFitnessFunction(
  task: TaskDefinition,
): FitnessAndNextSolutionsFunction<Solution> {

  let criteriaDefinition: Criterion[] = [
    {
      name: 'Avoid emojis',
      maxPointsIf: 'there are no emojis',
      maxPoints: 20,
    },
    {
      name: 'Up to 3 paragraphs',
      maxPointsIf: 'there are exactly 3 paragraphs',
      maxPoints: 20,
    },
    {
      name: 'General style',
      maxPointsIf: 'the style is concise, to the point, funny and witty',
      maxPoints: 20,
    },
    {
      name: 'Personal story',
      maxPointsIf: 'the post contains a touching personal story',
      maxPoints: 20,
    },
    {
      name: 'Virality',
      maxPointsIf: 'post should be written in a way so it can get a lot of likes',
      maxPoints: 20,
    },
  ]

  let fitnessAndNextSolutionsFunction = async (solutionWithMeta: SolutionWithMeta<Solution>) => {
    let rawResult = await gptExecute({
      fullPrompt: createFullPromptFromSections({
        intro: 'Rate on a scale from 0 to 100 (Use CRITERIA to assign values), how good is the following SOLUTION to the PROBLEM described below?',
        sections: {
          PROBLEM: task.task,
          SOLUTION: solutionWithMeta.solution,
          CRITERIA: shuffleArray(criteriaDefinition.slice()).map(c => `${c.name} - Max of ${c.maxPoints}pts if ${c.maxPointsIf}`).join('\n'),
        },
      }),
      maxTokens: 500,
      mode: 'FAST',
      outputType: {
        name: 'rating',
        description: 'Rating of the solution',
        parameters: {
          type: 'object',
          properties: {
            criteria: {
              type: 'array',
              description: 'Components of the final rating, from the CRITERIA section',
              items: {
                type: 'object',
                properties: {
                  criteria: {
                    type: 'string',
                    description: 'Name of the criteria',
                  },
                  reasoning: {
                    type: 'string',
                    description: 'Reasoning for the rating on this criteria',
                  },
                  suggestion: {
                    type: 'string',
                    description: 'Suggest to the user, what should be improved in order to maximize this criteria. Leave empty if no suggestion.',
                  },
                  rating: {
                    type: 'number',
                    description: 'Rating for the criteria',
                  }
                }
              }
            }
          },
          required: ['criteria'],
        },
      },
    });

    console.log(rawResult.result);
    let criteria, finalRating;
    try {
      let result = JSON.parse(rawResult.result);
      criteria = result.criteria;

      finalRating = sum(criteria.map((c:any) => c.rating as number));
    } catch (e) {
      console.log("ERROR");
      console.error(e);
      criteria = [];
      finalRating = 0;
    }

    //TODO: There should be a seperate gpt call for getting suggestions when nextPossibleSolutions is called, otherwise we are constantly using the same which may not lead to good results.
    //TODO: Find appropriate criteria to seek maxPoints
    const suggestions: string[] = criteria.filter((c:any) => c.rating < 20 && c.suggestion.length > 0).map((c:any) => c.suggestion as string);

    let fixes = [
      createNewSolutionFix(task),
      ...suggestions.map(s => improveSolutionFix({ task, solutionWithMeta, suggestions: s })),
      improveSolutionFix({ task, solutionWithMeta, suggestions: suggestions.join("\n") })
    ];

    return {
      fitness: finalRating as number,
      nextPossibleSolutions: async (): Promise<SolutionWithMeta<Solution>[]> => createSolutionsFromFixes({
        solutionWithMeta,
        fitnessAndNextSolutionsFunction,
        fixes, 
        maxBranching: BRANCHING
      })
    };
  };

  return fitnessAndNextSolutionsFunction;
}

(async function () {
  initCLISystems();

  stepEvolve({
    initialSolution: await createSolutionWithMetaWithFitness({
      solution: await createNewSolutionFix({ task: TASK })(),
      createdWith: 'initial',
      parent: undefined,
      fitnessAndNextSolutionsFunction: createFitnessFunction({ task: TASK }),
    }),
    threshold: THRESHOLD,
    maxNumIterations: ITERATIONS,
    observers: [
      {
        onInitialSolution: async (solutionWithMeta, iteration) => {
          console.log('Initial solution is: ' + solutionWithMeta.solution + '.');
        },
        onAccept: async (
          oldSolutionWithMeta,
          solutionWithMeta,
          iteration,
        ) => {
          console.log(
            'New best ' +
              iteration +
              ': ' +
              solutionWithMeta.solution +
              ' ' +
              solutionWithMeta.fitness +
              ' (' +
              solutionWithMeta.createdWith +
              ')' +
              '.',
          );
        },
        onFinalSolution: async (solutionWithMeta, iteration) => {
          console.log('Final solution is:')
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
