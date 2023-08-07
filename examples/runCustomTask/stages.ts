import { Stage } from '../../src/tasks/Stage';
import { mutateAppendToLog } from '../../src/tasks/mutators/mutateAppendToLog';
import { CUSTOM_STRATEGIES } from './strategies';
import { CustomTask } from './CustomTask';
import { mutateChooseKnowledgeAndStrategy } from '../../src/tasks/mutators/mutateChooseKnowledgeAndStrategy';
import { EXAMPLE_KNOWLEDGE } from './exampleKnowledge';

export const CUSTOM_PRE_STAGES: Stage<CustomTask>[] = [
  {
    name: 'Stage 1',
    weight: 100,
    execution: async function (this, task) {
      mutateAppendToLog(task, this.name + '\n');
    },
  },
  {
    name: 'Stage 2',
    weight: 100,
    execution: async function (this, task) {
      mutateAppendToLog(task, this.name + '\n');
    },
  },
  {
    name: 'Stage 3: Choose Strategy',
    weight: 100,
    execution: async function (this, task) {
      mutateAppendToLog(task, this.name + '\n');
      return mutateChooseKnowledgeAndStrategy({
        task,
        systemDescription: 'You are an AI Command Center, capable of writing linkedin posts.',
        availableStrategies: CUSTOM_STRATEGIES,
        availableKnowledge: EXAMPLE_KNOWLEDGE,
        taskToPrompt: async (task: CustomTask) => {
          return `User typed in "${task.userInput}"`;
        },
      });
    },
  },
];
