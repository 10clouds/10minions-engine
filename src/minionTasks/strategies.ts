import { Strategy } from '../strategyAndKnowledge/Strategy';

export type MINION_TASK_STRATEGY_ID = 'AnswerQuestion' | 'CodeChange';

export const MINION_TASK_STRATEGY_IDS = ['AnswerQuestion', 'CodeChange'] as const;

export const MINION_TASK_STRATEGIES: Strategy[] = [
  {
    id: 'AnswerQuestion',
    description:
      "Choose this classification if you don't want to modify code when doing this task or it's not appropriate to modifiy code based on this task. The result is not code, but textual description. A good example of this is when you are asked a question, and you need to answer it. For example: For example: are strings immutable in java? explain how this works, come up with 5 ideas for a name etc.",
  },
  {
    id: 'CodeChange',
    description:
      "Choose if it's makes sense to modify code for this task. For example: fix a bug, add a feature, add a test, are there any bugs?, critisize this code, refactor this code, document this code etc.",
  },
];
