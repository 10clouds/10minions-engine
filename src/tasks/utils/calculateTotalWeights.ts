import { TaskContext } from '../TaskContext';

export function calculateTotalWeights<T extends TaskContext<T>>(task: T): number {
  return task.stages.reduce((total, stage) => total + stage.weight, 0);
}
