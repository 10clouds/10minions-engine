import { mutateAppendToLog } from '../logs/mutators/mutateAppendToLog';
import { getEditorManager } from '../../managers/EditorManager';
import { calculateAndFormatExecutionTime } from '../../utils/calculateAndFormatExecutionTime';
import { TaskContext } from '../TaskContext';
import { TaskCanceled } from '../utils/TaskCanceled';
import { mutateStopExecution } from './mutateStopExecution';
import { WorkspaceFilesKnowledge } from '../../minionTasks/generateDescriptionForWorkspaceFiles';

export function mutateRunTaskStages<TC extends TaskContext>(
  task: TC,
  execute: (
    task: TC,
    getExternalData?: () => Promise<WorkspaceFilesKnowledge[]>,
    test?: boolean,
  ) => Promise<void>,
  getExternalData?: () => Promise<WorkspaceFilesKnowledge[]>,
  test?: boolean,
) {
  return new Promise<void>(async (resolve, reject) => {
    if (task.stopped) {
      return;
    }

    task.onSuccess = resolve;
    task.onErrorOrCancel = reject;

    try {
      task.progress = 0;
      await execute(task, getExternalData, test);
      await mutateStopExecution(task);
    } catch (error) {
      if (!(error instanceof TaskCanceled)) {
        getEditorManager().showErrorMessage(`Error in execution: ${error}`);
        console.error('Error in execution', error);
      }

      await mutateStopExecution(
        task,
        error instanceof Error ? `Error: ${error.message}` : String(error),
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
  });
}
