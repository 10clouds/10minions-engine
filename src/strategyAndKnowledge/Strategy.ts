import { Stage } from '../tasks/Stage';
import { TaskContext } from '../tasks/TaskContext';

export type Strategy<T extends TaskContext<T>> = {
  id: string;
  description: string;
  stages: Stage<T>[];
};
