import { taskChooseKnowledgeAndStrategy } from '../strategyAndKnowledge/mutators/taskChooseKnowledgeAndStrategy';
import { mutateEndStage } from '../tasks/mutators/mutateEndStage';
import { mutateStageFinishing } from '../tasks/mutators/mutateStageFinishing';
import { mutateStartStage } from '../tasks/mutators/mutateStartStage';
import { MinionTask } from './MinionTask';
import { advancedCodeChangeStrategy } from './advancedCodeChangeStrategy';
import { createChooseStrategyPrompt } from './createChooseStrategyPrompt';
import { WorkspaceFilesKnowledge } from './generateDescriptionForWorkspaceFiles';
import { minionsKnowledge } from './knowledge/knowledge';
import { mutateCreateAnswer } from './mutators/mutateCreateAnswer';
import { mutateStageStarting } from './mutators/mutateStageStarting';
import { MINION_TASK_STRATEGIES, MINION_TASK_STRATEGY_ID } from './strategies';

export async function mutateExecuteMinionTaskStages(task: MinionTask, workspaceFilesKnowledge: WorkspaceFilesKnowledge[] = [], test?: boolean) {
  mutateStartStage({ task, name: 'Starting ...', progressIncrement: 0.05 });
  mutateStageStarting(task);
  mutateEndStage(task);
  mutateStartStage({ task, name: 'Understanding ...', progressIncrement: 0.3 });
  const knowledge = [...workspaceFilesKnowledge, ...minionsKnowledge];
  const { strategy, relevantKnowledge } = await taskChooseKnowledgeAndStrategy({
    task,
    systemDescription: 'You are an AI Command Center, capable to improve code and support developer/programmer during development.',
    availableStrategies: MINION_TASK_STRATEGIES,
    availableKnowledge: knowledge,
    taskToPrompt: createChooseStrategyPrompt,
  });
  task.strategyId = strategy.id as MINION_TASK_STRATEGY_ID;
  task.relevantKnowledgeIds = relevantKnowledge.map((knowledge) => knowledge.id);
  task.relevantKnowledge = relevantKnowledge as WorkspaceFilesKnowledge[];
  mutateEndStage(task);
  switch (task.strategyId) {
    case 'AnswerQuestion':
      mutateStartStage({ task, name: 'Conceptualising ...', progressIncrement: 0.6 });
      await mutateCreateAnswer(task, relevantKnowledge);

      mutateEndStage(task);
      break;
    // TODO: left as reference
    // case 'CodeChange':
    //   mutateStartStage({ task, name: 'Conceptualising ...', progressIncrement: 0.3 });
    //   await mutateCreateModification(task);
    //   mutateEndStage(task);

    //   mutateStartStage({ task, name: 'Preparing Changes ...', progressIncrement: 0.3 });
    //   await mutateCreateModificationProcedure(task);
    //   mutateEndStage(task);
    //   break;
    case 'CodeChange':
      await advancedCodeChangeStrategy(task, test);
      break;
    default:
      throw new Error(`Strategy ${task.strategyId} not implemented`);
  }

  mutateStartStage({ task, name: 'Finishing ...', progressIncrement: 0.05 });
  mutateStageFinishing(task);
  mutateEndStage(task);
}
