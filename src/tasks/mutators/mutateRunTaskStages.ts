import { getEditorManager } from '../../managers/EditorManager';
import { WorkspaceFilesKnowledge } from '../../minionTasks/generateDescriptionForWorkspaceFiles';
import { calculateAndFormatExecutionTime } from '../../utils/calculateAndFormatExecutionTime';
import { mutateAppendToLog } from '../logs/mutators/mutateAppendToLog';
import { TaskContext } from '../TaskContext';
import { TaskCanceledError } from '../utils/TaskCanceled';
import { mutateStopExecution } from './mutateStopExecution';

export async function mutateRunTaskStages<TC extends TaskContext>(
  task: TC,
  execute: (
    task: TC,
    getExternalData?: () => Promise<WorkspaceFilesKnowledge[]>,
    test?: boolean,
  ) => Promise<void>,
  getExternalData?: () => Promise<WorkspaceFilesKnowledge[]>,
  test?: boolean,
) {
  if (task.stopped) {
    return;
  }

  task.progress = 0;

  try {
    await execute(task, getExternalData, test);
    await mutateStopExecution(task);
    task.onSuccess?.();
  } catch (error) {
    if (!(error instanceof TaskCanceledError)) {
      getEditorManager().showErrorMessage(`Error in execution: ${error}`);
      console.error('Error in execution', error);
    }

    await mutateStopExecution(
      task,
      error instanceof Error ? `Error: ${error.message}` : String(error),
    );
    task.onErrorOrCancel?.(
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    const executionTime = Date.now() - task.startTime;
    const formattedExecutionTime =
      calculateAndFormatExecutionTime(executionTime);

    mutateAppendToLog(task, `Total Cost: ~${task.totalCost.toFixed(2)}$`);
    mutateAppendToLog(
      task,
      `${task.executionStage} (Execution Time: ${formattedExecutionTime})`,
    );

    task.progress = 1;
  }
}
