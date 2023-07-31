import { TaskContext } from './TaskContext';

/**
 * Interface representing a stage in the task execution process.
 */
export interface Stage<T extends TaskContext<T>> {
  name: string;
  weight: number;
  execution: (task: T) => Promise<void>;
}
