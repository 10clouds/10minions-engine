import { Stage } from '../../src/tasks/Stage';
import { CustomTask } from './CustomTask';

export const CUSTOM_STAGES: Stage<CustomTask>[] = [
  {
    name: 'Stage 1',
    weight: 100,
    execution: async (task) => {
      console.log('Stage 1');
    },
  },
  {
    name: 'Stage 2',
    weight: 100,
    execution: async (task) => {
      console.log('Stage 2');
    },
  },
  {
    name: 'Stage 3',
    weight: 100,
    execution: async (task) => {
      console.log('Stage 3');
    },
  },
];
