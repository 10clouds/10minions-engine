import { getEditorManager } from '../../managers/EditorManager';
import { calculateAndFormatExecutionTime } from '../../utils/calculateAndFormatExecutionTime';
import { TaskContext } from '../TaskContext';
import { CANCELED_STAGE_NAME } from '../stageNames';
import { TaskCanceled } from '../utils/TaskCanceled';
import { mutateAppendToLog } from './mutateAppendToLog';
import { mutateStopExecution } from './mutateStopExecution';

export function mutateRunTaskStages<TC extends TaskContext>(task: TC, execute: (task: TC) => Promise<void>) {
  return new Promise<void>(async (resolve, reject) => {
    if (task.stopped) {
      return;
    }

    task.onSuccess = resolve;
    task.onErrorOrCancel = reject;

    try {
      execute(task);
      await mutateStopExecution(task);
    } catch (error) {
      if (!(error instanceof TaskCanceled)) {
        getEditorManager().showErrorMessage(`Error in execution: ${error}`);
        console.error('Error in execution', error);
      }

      await mutateStopExecution(task, error instanceof Error ? `Error: ${error.message}` : String(error));
    } finally {
      const executionTime = Date.now() - task.startTime;
      const formattedExecutionTime = calculateAndFormatExecutionTime(executionTime);

      mutateAppendToLog(task, `Total Cost: ~${task.totalCost.toFixed(2)}$\n`);
      mutateAppendToLog(task, `${task.executionStage} (Execution Time: ${formattedExecutionTime})\n`);

      task.progress = 1;
    }
  });
}
