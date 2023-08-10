import { TaskContext } from '../TaskContext';
import { TaskCanceled } from '../utils/TaskCanceled';

export function mutateEndStage(task: TaskContext) {
  if (task.stopped) {
    throw new TaskCanceled();
  }

  task.progress = task.stageTargetProgress;
  task.onChange(false);
}
