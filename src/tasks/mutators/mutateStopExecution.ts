import { TaskContext } from '../TaskContext';
import { FINISHED_STAGE_NAME } from '../stageNames';

export async function mutateStopExecution<T extends TaskContext<T>>(task: T, error?: string, important = true) {
  if (task.stopped) {
    return;
  }

  task.stopped = true;
  task.executionStage = error ? error : FINISHED_STAGE_NAME;

  if (task.rejectProgress && error) task.rejectProgress(error);
  else if (task.resolveProgress) task.resolveProgress();

  task.rejectProgress = undefined;
  task.resolveProgress = undefined;

  await task.onChanged(important);
}
