import { generateScoreTests } from '../../score/generateScoreTests';
import { stepEvolve } from '../stepEvolve/stepEvolve';
import { mutateAppendToLog } from '../tasks/logs/mutators/mutateAppendToLog';
import { mutateEndStage } from '../tasks/mutators/mutateEndStage';
import { mutateStartStage } from '../tasks/mutators/mutateStartStage';
import { generateInitialSolutions } from './generateInitialSolutions';
import { MinionTask } from './MinionTask';
import { onFinalSolution } from './observers/onFinalSolution';
import { onInitialSolutions } from './observers/onInitialSolutions';
import { onProgressMade } from './observers/onProgressMade';
import { MinionTaskSolution, ParsedCriteriaDefinition } from './types';

const ITERATIONS = 3;
const MAX_STALE_ITERATIONS = 3;
const THRESHOLD = 120;

const FULL_PROGRESS = 1;
const PROGRESS_FOR_PRE_STAGES = 0.2;
const PROGRESS_FOR_STRATEGY_STAGES = FULL_PROGRESS - PROGRESS_FOR_PRE_STAGES;
const PROGRESS_PER_PRE_STAGE = PROGRESS_FOR_PRE_STAGES / ITERATIONS;

export const advancedCodeChangeStrategy = async (
  task: MinionTask,
  test?: boolean,
) => {
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

  const parsedCriteriaDefinition: ParsedCriteriaDefinition = (
    criteriaDefinition ? JSON.parse(criteriaDefinition.result) : {}
  ) as ParsedCriteriaDefinition;

  const { initialSolutions, costs: initialSolutionsCosts } =
    await generateInitialSolutions(
      task,
      ITERATIONS,
      PROGRESS_PER_PRE_STAGE,
      parsedCriteriaDefinition,
    );

  if (initialSolutions?.length) {
    costs += initialSolutionsCosts;
  }

  const finalSolution = await stepEvolve<MinionTaskSolution>({
    task,
    initialSolutions,
    threshold: THRESHOLD,
    maxNumIterations: ITERATIONS,
    maxStaleIterations: MAX_STALE_ITERATIONS,
    observers: [
      {
        onInitialSolutions: onInitialSolutions(task),
        onProgressMade: onProgressMade(task),
        onFinalSolution: onFinalSolution(task),
      },
    ],
  });

  const { modificationDescription, modificationProcedure } =
    finalSolution?.solution || ({} as MinionTaskSolution);
  task.totalCost += costs;
  task.modificationProcedure = modificationProcedure;
  task.modificationDescription = modificationDescription;
  console.log('FINAL TASK: ', task);
  console.log('TASK COST: ', task.totalCost);
  task.onChange(true);
  mutateEndStage(task);
};
