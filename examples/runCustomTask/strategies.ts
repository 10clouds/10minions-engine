import { Strategy } from '../../src/tasks/Strategy';
import { mutateAppendToLog } from '../../src/tasks/mutators/mutateAppendToLog';
import { CustomTask } from './CustomTask';
import { EXAMPLE_KNOWLEDGE } from './exampleKnowledge';
import { mutateCreateCustomAnswer } from './mutateCreateCustomAnswer';

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
          await mutateCreateCustomAnswer(task, 'Answer to this in Polish language', EXAMPLE_KNOWLEDGE);
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
          await mutateCreateCustomAnswer(task, 'Answer to this with a poem', EXAMPLE_KNOWLEDGE);
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
          await mutateCreateCustomAnswer(task, 'Answer to this as Javascript code', EXAMPLE_KNOWLEDGE);
        },
      },
    ],
  },
];
