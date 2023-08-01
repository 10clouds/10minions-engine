import { Stage } from '../../src/tasks/Stage';
import { mutateAppendToLog } from '../../src/tasks/mutators/mutateAppendToLog';
import { mutateStageChooseStrategy } from '../../src/tasks/mutators/mutateStageChooseStrategy';
import { CUSTOM_STRATEGIES } from './strategies';
import { CustomTask } from './CustomTask';

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
      return mutateStageChooseStrategy(task, CUSTOM_STRATEGIES, async (task: CustomTask) => {
        return `User typed in "${task.userInput}"`;
      });
    },
  },
];
