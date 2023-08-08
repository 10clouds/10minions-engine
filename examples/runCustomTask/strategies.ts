import { Strategy } from '../../src/strategyAndKnowledge/Strategy';
import { mutateAppendToLog } from '../../src/tasks/mutators/mutateAppendToLog';
import { CustomTask } from './CustomTask';
import { EXAMPLE_KNOWLEDGE } from './exampleKnowledge';
import { mutateCreateSimpleAnswer } from '../../src/strategyAndKnowledge/mutators/mutateCreateSimpleAnswer';

export const CUSTOM_STRATEGIES: Strategy<CustomTask>[] = [
  {
    id: 'AnswerWithPolish',
    description: 'Answer with plain text in Polish language',
    stages: [
      {
        name: 'Stage 4: (AnswerWithPolish)',
        weight: 100,
        execution: async function (this, task) {
          mutateAppendToLog(task, this.name + '\n');
          await mutateCreateSimpleAnswer({
            task,
            prePrompt: 'Answer to this in Polish language',
            inputField: 'userInput',
            outputField: 'answer',
            availableKnowledge: EXAMPLE_KNOWLEDGE,
          });
        },
      },
    ],
  },
  {
    id: 'AnswerWithPoem',
    description: 'Choose this if you want to answer with a poem',
    stages: [
      {
        name: 'Stage 4 (AnswerWithPoem)',
        weight: 100,
        execution: async function (this, task) {
          mutateAppendToLog(task, this.name + '\n');
          await mutateCreateSimpleAnswer({
            task,
            prePrompt: 'Answer to this with a poem',
            inputField: 'userInput',
            outputField: 'answer',
            availableKnowledge: EXAMPLE_KNOWLEDGE,
          });
        },
      },
    ],
  },
  {
    id: 'AnswerWithCode',
    description: 'Choose this if you want to answer with javascript code',
    stages: [
      {
        name: 'Stage 1 (AnswerWithCode)',
        weight: 100,
        execution: async function (this, task) {
          mutateAppendToLog(task, this.name + '\n');
          await mutateCreateSimpleAnswer({
            task,
            prePrompt: 'Answer to this as Javascript code',
            inputField: 'userInput',
            outputField: 'answer',
            availableKnowledge: EXAMPLE_KNOWLEDGE,
          });
        },
      },
    ],
  },
];
