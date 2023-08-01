import { mutateStageStarting } from './mutators/mutateStageStarting';
import { mutateStageChooseStrategy } from '../tasks/mutators/mutateStageChooseStrategy';
import { mutateStageFinishing } from '../tasks/mutators/mutateStageFinishing';
import { mutateCreateModification } from './mutators/mutateCreateModification';
import { mutateCreateAnswer } from './mutators/mutateCreateAnswer';
import { Stage } from '../tasks/Stage';
import { mutateCreateModificationProcedure } from './mutators/mutateCreateModificationProcedure';
import { MinionTask } from './MinionTask';
import { Strategy } from '../tasks/Strategy';
import { z } from 'zod';
import { createChooseStrategyPrompt } from './createChooseStrategyPrompt';

export type TASK_STRATEGY_ID = 'AnswerQuestion' | 'AutonomousAgent' | 'VectorizeAndExecute' | 'WorkspaceWide' | 'CodeChange';

export const TASK_STRATEGY_IDS = ['AnswerQuestion', 'AutonomousAgent', 'VectorizeAndExecute', 'WorkspaceWide', 'CodeChange'] as const;

export const PRE_STAGES: Stage<MinionTask>[] = [
  {
    name: 'Starting ...',
    weight: 10,
    execution: mutateStageStarting,
  },
  {
    name: 'Understanding ...',
    weight: 50,
    execution: (task: MinionTask) => mutateStageChooseStrategy(task, TASK_STRATEGIES, createChooseStrategyPrompt),
  },
];

export const TASK_STRATEGIES: Strategy<MinionTask>[] = [
  /*{
    name: "AutonomousAgent",
    description:
      "Choose this strategy only if explicitly asked for in the TASK.",
    stages: [
      {
        name: "Extracting ...",
        weight: 100,
        execution: stageExtractRelevantCode,
      },
      {
        name: "Finishing ...",
        weight: 10,
        execution: stageFinishing,
      },
    ],
  },*/
  /*{
    name: "VectorizeAndExecute",
    description:
      "Choose this strategy only if explicitly asked for in the TASK.",
    stages: [
      {
        name: "Extracting ...",
        weight: 100,
        execution: stageExtractRelevantCode,
      },
      {
        name: "Finishing ...",
        weight: 10,
        execution: stageFinishing,
      },
    ],
  },*/
  /*{
    name: "WorkspaceWide",
    description:
      "Choose this strategy only if explicitly asked for in the TASK.",
    stages: [
      {
        name: "Extracting ...",
        weight: 100,
        execution: stageExtractRelevantCode,
      },
      {
        name: "Finishing ...",
        weight: 10,
        execution: stageFinishing,
      },
    ],
  },*/
  {
    id: 'AnswerQuestion',
    description:
      "Choose this classification if you don't want to modify code when doing this task or it's not appropriate to modifiy code based on this task. The result is not code, but textual description. A good example of this is when you are asked a question, and you need to answer it. For example: For example: are strings immutable in java? explain how this works, come up with 5 ideas for a name etc.",
    stages: [
      {
        name: 'Conceptualising ...',
        weight: 100,
        execution: mutateCreateAnswer,
      },
      {
        name: 'Finishing ...',
        weight: 10,
        execution: mutateStageFinishing,
      },
    ],
    outputSchema: z.string(),
  },
  {
    id: 'CodeChange',
    description:
      "Choose if it's makes sense to modify code for this task. For example: fix a bug, add a feature, add a test, are there any bugs?, critisize this code, refactor this code, document this code etc.",
    stages: [
      {
        name: 'Conceptualising ...',
        weight: 100,
        execution: mutateCreateModification,
      },
      {
        name: 'Preparing Changes ...',
        weight: 80,
        execution: mutateCreateModificationProcedure,
      },
      {
        name: 'Finishing ...',
        weight: 10,
        execution: mutateStageFinishing,
      },
    ],
    outputSchema: z.string(),
  },
];
