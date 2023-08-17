import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { initCLISystems } from '../../src/CLI/setupCLISystems';
import { SolutionWithMeta } from '../../src/stepEvolve/FitnessFunction';
import { createSolutionWithMetaWithFitness } from '../../src/stepEvolve/createSolutionWithMetaWithFitness';
import { stepEvolve } from '../../src/stepEvolve/stepEvolve';
import { Knowledge } from '../../src/strategyAndKnowledge/Knowledge';
import { Strategy } from '../../src/strategyAndKnowledge/Strategy';
import { mutateCreateSimpleAnswer } from '../../src/strategyAndKnowledge/mutators/mutateCreateSimpleAnswer';
import { taskChooseKnowledgeAndStrategy } from '../../src/strategyAndKnowledge/mutators/taskChooseKnowledgeAndStrategy';
import { mutateAppendToLog } from '../../src/tasks/logs/mutators/mutateAppendToLog';
import { mutateEndStage } from '../../src/tasks/mutators/mutateEndStage';
import { mutateRunTaskStages } from '../../src/tasks/mutators/mutateRunTaskStages';
import { mutateStartStage } from '../../src/tasks/mutators/mutateStartStage';
import { formatPrompt } from '../../src/utils/string/formatPrompt';
import { CustomTask } from './CustomTask';
import { createFitnessAndNextSolutionsFunction } from './createFitnessAndNextSolutionsFunction';
import { createNewSolutionFix } from './fixes/fixCreateNewSolution';
import { emptyDirSync } from './emptyDirSync';

const TASK = formatPrompt(`
  Create a world class best official annoucement on linkedin by the CEO of 10Clouds that announces 10Clouds AI Labs.
  Output only post text, do not add any section markers or additional sections in your response.
`);

const INTRO = formatPrompt(`
  This example creates a custom task and runs it while tracking progress.
  The task is to write and improve on a linkedin post that meets given criteria.
  The task is to first choose a strategy for answering a question, and then to answer the question.
  The question is: "${TASK}"
`);

const ITERATIONS = 10;
const MAX_STALE_ITERATIONS = 3;
const THRESHOLD = 120;
const BRANCHING = 3;

const CUSTOM_STRATEGIES: Strategy[] = [
  /*{
    id: 'SimpleQuickAnswer',
    description: 'For sumamrisations, creative writing and quick answers',
  },*/
  {
    id: 'DeepAnalysis',
    description: 'Choose this when the answer requires sophisticated criteria and deep analysis',
  },
];

const EXAMPLE_KNOWLEDGE: Knowledge[] = [
  {
    id: 'InfoAbout10Clouds',
    description: 'Info About 10Clouds company, use it if you need to know more about the company.',
    content: readFileSync(path.join(__dirname, 'knowledge', 'info-about-10c.txt'), 'utf8'),
  },
  {
    id: 'InfoAboutCEO',
    description: 'Info About CEO of 10Clouds, use it if you need to know more about the CEO.',
    content: readFileSync(path.join(__dirname, 'knowledge', 'info-about-ceo.txt'), 'utf8'),
  },
  {
    id: 'InfoAboutCEOPersonalBrandingStrategy',
    description: 'Info About CEO of 10Clouds personal branding strategy, use it if you need to know more about the CEO personal branding strategy.',
    content: readFileSync(path.join(__dirname, 'knowledge', 'info-about-ceo-branding-strategy.txt'), 'utf8'),
  },
  {
    id: 'InfoAboutAILabs',
    description: 'Info About AI Labs (formed by 10Clouds), use it if you need to know more about the AI Labs.',
    content: readFileSync(path.join(__dirname, 'knowledge', 'info-about-ai-labs.txt'), 'utf8'),
  },
];

(async function () {
  console.log(INTRO);

  console.log('Initiating ...');
  initCLISystems();

  console.log('Creating task ...');
  const task = new CustomTask({
    userInput: TASK,
    id: '1',
    totalCost: 0,
    stopped: false,
    onChanged: async () => {
      console.log('Changed ' + task.progress);
    },
    executionStage: '',
    progress: 0,
    stageTargetProgress: 0,
    startTime: Date.now(),
    logContent: '',
    rejectTask: () => {},
    resolveTask: () => {},
  });

  console.log('Running task ...');
  await mutateRunTaskStages(task, async (task) => {
    const FULL_PROGRESS = 1;
    const NUMBER_OF_PRE_STAGES = 3;
    const PROGRESS_FOR_PRE_STAGES = 0.5;
    const PROGRESS_FOR_STRATEGY_STAGES = FULL_PROGRESS - PROGRESS_FOR_PRE_STAGES;
    const PROGRESS_PER_PRE_STAGE = PROGRESS_FOR_PRE_STAGES / NUMBER_OF_PRE_STAGES;

    mutateStartStage({ task, name: 'Stage 1', progressIncrement: PROGRESS_PER_PRE_STAGE });
    mutateAppendToLog(task, 'Stage 1');

    // Before invoking the stepEvolve function, delete all log files
    emptyDirSync(path.join(__dirname, 'logs'));
    mkdirSync(path.join(__dirname, 'logs'));

    mutateEndStage(task);

    mutateStartStage({ task, name: 'Stage 2', progressIncrement: PROGRESS_PER_PRE_STAGE });
    mutateAppendToLog(task, 'Stage 2');
    mutateEndStage(task);

    mutateStartStage({ task, name: 'Stage 3: Choose Strategy', progressIncrement: PROGRESS_PER_PRE_STAGE });
    mutateAppendToLog(task, 'Stage 3: Choose Strategy');
    const { strategy, relevantKnowledge } = await taskChooseKnowledgeAndStrategy({
      task,
      systemDescription: 'You are an AI Command Center, capable of writing linkedin posts.',
      availableStrategies: CUSTOM_STRATEGIES,
      availableKnowledge: EXAMPLE_KNOWLEDGE,
      taskToPrompt: async (task: CustomTask) => {
        return `User typed in "${task.userInput}"`;
      },
    });

    task.relevantKnowledgeIds = relevantKnowledge.map((knowledge) => knowledge.id);
    task.strategyId = strategy.id;
    task.onChange(true);

    mutateEndStage(task);

    switch (strategy.id) {
      case 'SimpleQuickAnswer':
        mutateStartStage({ task, name: 'Stage 4 (SimpleQuickAnswer)', progressIncrement: PROGRESS_FOR_STRATEGY_STAGES });
        mutateAppendToLog(task, 'Stage 4 (SimpleQuickAnswer)');
        task.answer = await mutateCreateSimpleAnswer({
          task,
          prePrompt: 'Answer to this in Polish language',
          input: task.userInput,
          relevantKnowledge,
        });
        task.onChange(true);
        mutateEndStage(task);
        break;
      case 'DeepAnalysis':
        mutateStartStage({ task, name: 'Stage 4 (DeepAnalysis)', progressIncrement: PROGRESS_FOR_STRATEGY_STAGES });
        mutateAppendToLog(task, 'Stage 4 (DeepAnalysis)');

        const initialSolutionsPromises = [];
        for (let i = 0; i < 3; i++) {
          initialSolutionsPromises.push(
            createSolutionWithMetaWithFitness({
              solution: await createNewSolutionFix({ task: TASK }).call(),
              createdWith: 'initial',
              fitnessAndNextSolutionsFunction: createFitnessAndNextSolutionsFunction({ task: { task: TASK }, maxBranching: BRANCHING }),
            }),
          );
        }

        const initialSolutions = await Promise.all(initialSolutionsPromises);

        const finalSolution = await stepEvolve({
          initialSolutions,
          threshold: THRESHOLD,
          maxNumIterations: ITERATIONS,
          maxStaleIterations: MAX_STALE_ITERATIONS,
          observers: [
            {
              onInitialSolutions: async (solutionsWithMeta, iteration) => {
                for (const solutionWithMeta of solutionsWithMeta) {
                  mutateAppendToLog(
                    task,
                    'Initial solution is: ' + solutionWithMeta.solution + ' ' + solutionWithMeta.totalFitness + ' (' + solutionWithMeta.createdWith + ')' + '.',
                  );
                }
                writeFileSync(path.join(__dirname, 'logs', `${iteration}.json`), JSON.stringify({ iteration, solutionsWithMeta }, null, 2));
              },
              onProgressMade: async (
                oldSolutionsWithMeta: SolutionWithMeta<string>[],
                accepted: SolutionWithMeta<string>[],
                rejected: SolutionWithMeta<string>[],
                newSolutions: SolutionWithMeta<string>[],
                iteration: number,
              ) => {
                writeFileSync(path.join(__dirname, 'logs', `${iteration}.json`), JSON.stringify({ iteration, accepted, rejected, newSolutions }, null, 2));
                //mutateAppendToLog(task, `Solutions ${oldSolutionsWithMeta.map((s) => s.solution).join(', ')}`);

                for (const solutionWithMeta of accepted) {
                  mutateAppendToLog(
                    task,
                    `New best ${iteration}: ${solutionWithMeta.solution} ${solutionWithMeta.totalFitness} (${solutionWithMeta.createdWith}).`,
                  );
                }
              },
              onFinalSolution: async (solutionWithMeta, iteration) => {
                const { totalFitness, solution, iteration: solutionIteration } = solutionWithMeta;

                mutateAppendToLog(task, 'Final solution is:');
                mutateAppendToLog(task, '```');
                mutateAppendToLog(task, solution);
                mutateAppendToLog(task, '```');
                mutateAppendToLog(task, 'Fitness: ' + totalFitness);
                mutateAppendToLog(task, 'Iteration: ' + iteration + ' (Best solution found in iteration: ' + solutionIteration + ')');
              },
            },
          ],
        });

        task.answer = finalSolution.solution;
        task.onChange(true);
        mutateEndStage(task);
        break;
    }
  });

  console.log(task.logContent);
  console.log('Done');
})();
