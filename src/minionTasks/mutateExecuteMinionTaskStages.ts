import { taskChooseStrategy } from '../strategyAndKnowledge/mutators/taskChooseStrategy';
import { mutateEndStage } from '../tasks/mutators/mutateEndStage';
import { mutateStageFinishing } from '../tasks/mutators/mutateStageFinishing';
import { mutateStartStage } from '../tasks/mutators/mutateStartStage';
import { MinionTask } from './MinionTask';
import { createChooseStrategyPrompt } from './createChooseStrategyPrompt';
import { mutateCreateAnswer } from './mutators/mutateCreateAnswer';
import { mutateCreateModification } from './mutators/mutateCreateModification';
import { mutateCreateModificationProcedure } from './mutators/mutateCreateModificationProcedure';
import { mutateStageStarting } from './mutators/mutateStageStarting';
import { MINION_TASK_STRATEGIES } from './strategies';

export async function mutateExecuteMinionTaskStages(task: MinionTask) {
  mutateStartStage({ task, name: 'Starting ...', progressIncrement: 0.05 });
  mutateStageStarting(task);
  mutateEndStage(task);

  mutateStartStage({ task, name: 'Understanding ...', progressIncrement: 0.3 });
  await taskChooseStrategy(task, MINION_TASK_STRATEGIES, createChooseStrategyPrompt);
  mutateEndStage(task);

  switch (task.strategyId) {
    case 'AnswerQuestion':
      mutateStartStage({ task, name: 'Conceptualising ...', progressIncrement: 0.6 });
      await mutateCreateAnswer(task);
      mutateEndStage(task);
      break;
    case 'CodeChange':
      mutateStartStage({ task, name: 'Conceptualising ...', progressIncrement: 0.3 });
      await mutateCreateModification(task);
      mutateEndStage(task);

      mutateStartStage({ task, name: 'Preparing Changes ...', progressIncrement: 0.3 });
      await mutateCreateModificationProcedure(task);
      mutateEndStage(task);
      break;
    default:
      throw new Error(`Strategy ${task.strategyId} not implemented`);
  }

  mutateStartStage({ task, name: 'Finishing ...', progressIncrement: 0.05 });
  mutateStageFinishing(task);
  mutateEndStage(task);
}
