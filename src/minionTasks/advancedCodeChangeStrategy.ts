import fs from 'fs';
import { writeFile } from 'node:fs/promises';
import path from 'path';
import { SolutionWithMeta } from '../stepEvolve/FitnessFunction';
import { createSolutionWithMetaWithFitness } from '../stepEvolve/createSolutionWithMetaWithFitness';
import { stepEvolve } from '../stepEvolve/stepEvolve';
import { mutateAppendToLog } from '../tasks/logs/mutators/mutateAppendToLog';
import { mutateEndStage } from '../tasks/mutators/mutateEndStage';
import { mutateStartStage } from '../tasks/mutators/mutateStartStage';
import { MinionTask } from './MinionTask';
import { Selection, initMinionTask } from '../../score/initTestMinionTask';
import { createFitnessAndNextSolutionsFunction } from '../stepEvolve/createFitnessAndNextSolutionsFunction';
import { generateScoreTests } from '../../score/generateScoreTests';
import { ScoreTestType } from '../../score/types';
import { format as dtFormat } from 'date-and-time';
import { createNewSolutionFix } from '../stepEvolve/createNewSolutionFix';

const ITERATIONS = 3;
const MAX_STALE_ITERATIONS = 3;
const THRESHOLD = 120;
const BRANCHING = 3;

const FULL_PROGRESS = 1;
const PROGRESS_FOR_PRE_STAGES = 0.2;
const PROGRESS_FOR_STRATEGY_STAGES = FULL_PROGRESS - PROGRESS_FOR_PRE_STAGES;
const PROGRESS_PER_PRE_STAGE = PROGRESS_FOR_PRE_STAGES / ITERATIONS;

export interface MinionTaskSolution {
  resultingCode: string;
  modificationProcedure: string;
  modificationDescription: string;
  originalCode?: string;
}

type MinionTaskSolutionWithMeta = SolutionWithMeta<MinionTaskSolution>;

export const advancedCodeChangeStrategy = async (task: MinionTask, test?: boolean) => {
  let costs = task.totalCost || 0;

  mutateStartStage({
    task,
    name: 'Stage 4 (DeepAnalysis)',
    progressIncrement: PROGRESS_FOR_STRATEGY_STAGES,
  });
  mutateAppendToLog(task, 'Stage 4 (DeepAnalysis)');

  const criteriaDefinition = await generateScoreTests(task, test);

  if (criteriaDefinition) {
    costs += criteriaDefinition.cost;
  }

  const parsedCriteriaDefinition: { items: ScoreTestType[] } = criteriaDefinition && JSON.parse(criteriaDefinition.result);
  const selectionData: Selection = {
    start: task.selection.start,
    end: task.selection.end,
    selectedText: task.selectedText,
  };

  const initialSolutionsPromises = [];

  for (let i = 0; i < ITERATIONS; i++) {
    mutateStartStage({
      task,
      name: 'Preparing solutions...',
      progressIncrement: PROGRESS_PER_PRE_STAGE,
    });

    const { execution: tempMinionTask } = await initMinionTask(task.userQuery, task.documentURI.fsPath, selectionData);
    tempMinionTask.relevantKnowledge = task.relevantKnowledge;
    initialSolutionsPromises.push(
      createSolutionWithMetaWithFitness({
        solution: await createNewSolutionFix(tempMinionTask),
        createdWith: 'initial',
        fitnessAndNextSolutionsFunction: createFitnessAndNextSolutionsFunction({
          task: tempMinionTask,
          maxBranching: BRANCHING,
          criteriaDefinition: parsedCriteriaDefinition,
        }),
      }),
    );

    costs += tempMinionTask.totalCost;
    mutateEndStage(task);
  }

  const initialSolutions = await Promise.all(initialSolutionsPromises);

  const finalSolution = await stepEvolve<MinionTaskSolution>({
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
          const logsPath = path.resolve(__dirname, 'logs');

          if (!fs.existsSync(logsPath)) {
            fs.mkdirSync(logsPath, { recursive: true });
          }
          writeFile(
            path.join(__dirname, 'logs', `${iteration}-${dtFormat(new Date(), 'YYYY-MM-DD_HH-mm-ss')}.json`),
            JSON.stringify({ iteration, solutionsWithMeta }, null, 2),
            'utf8',
          );
        },
        onProgressMade: async (
          oldSolutionsWithMeta: MinionTaskSolutionWithMeta[],
          accepted: MinionTaskSolutionWithMeta[],
          rejected: MinionTaskSolutionWithMeta[],
          newSolutions: MinionTaskSolutionWithMeta[],
          iteration: number,
        ) => {
          writeFile(path.join(__dirname, 'logs', `${iteration}.json`), JSON.stringify({ iteration, accepted, rejected, newSolutions }, null, 2), 'utf8');
          mutateAppendToLog(task, `Solutions ${oldSolutionsWithMeta.map((s) => s.solution).join(', ')}`);

          for (const solutionWithMeta of accepted) {
            mutateAppendToLog(task, `New best ${iteration}: ${solutionWithMeta.solution} ${solutionWithMeta.totalFitness} (${solutionWithMeta.createdWith}).`);
          }
        },
        onFinalSolution: async (solutionWithMeta, iteration) => {
          const {
            totalFitness,
            solution: { resultingCode },
            iteration: solutionIteration,
          } = solutionWithMeta;

          mutateAppendToLog(task, 'Final solution is:');
          mutateAppendToLog(task, '```');
          mutateAppendToLog(task, resultingCode);
          mutateAppendToLog(task, '```');
          mutateAppendToLog(task, 'Fitness: ' + totalFitness);
          mutateAppendToLog(task, 'Iteration: ' + iteration + ' (Best solution found in iteration: ' + solutionIteration + ')');
        },
      },
    ],
  });

  const { modificationDescription, modificationProcedure } = finalSolution.solution;
  task.totalCost += costs;
  task.modificationProcedure = modificationProcedure;
  task.modificationDescription = modificationDescription;
  console.log('FINAL TASK: ', task);
  console.log('TASK COST: ', task.totalCost);
  task.onChange(true);
  mutateEndStage(task);
};
