import { TaskContext } from '../TaskContext';
import { FINISHED_STAGE_NAME } from '../stageNames';

export async function mutateStopExecution<T extends TaskContext<T>>(task: T, error?: string, important = true) {
  if (task.stopped) {
    return;
  }

  task.stopped = true;
  task.executionStage = error ? error : FINISHED_STAGE_NAME;

  if (task.onErrorOrCancel && error) task.onErrorOrCancel(error);
  else if (task.onSuccess) task.onSuccess();

  task.onErrorOrCancel = undefined;
  task.onSuccess = undefined;

  await task.onChange(important);
}
