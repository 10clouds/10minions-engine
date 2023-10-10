import { TaskContext } from '../TaskContext';
import { TaskCanceledError } from '../utils/TaskCanceled';

export function mutateEndStage(task: TaskContext) {
  if (task.stopped) {
    throw new TaskCanceledError();
  }

  task.progress = task.stageTargetProgress;
  task.onChange(false);
}
