import { getEditorManager } from '../../managers/EditorManager';
import { calculateAndFormatExecutionTime } from '../../utils/calculateAndFormatExecutionTime';
import { TaskContext } from '../TaskContext';
import { CANCELED_STAGE_NAME } from '../stageNames';
import { calculateTotalWeights } from '../utils/calculateTotalWeights';
import { mutateAppendToLog } from './mutateAppendToLog';
import { mutateStopExecution } from './mutateStopExecution';

export function mutateRunTask<T extends TaskContext<T>>(task: T) {
  return new Promise<void>(async (resolve, reject) => {
    if (task.stopped) {
      return;
    }

    task.onSuccess = resolve;
    task.onErrorOrCancel = reject;
    task.currentStageIndex = 0;

    try {
      while (task.currentStageIndex < task.stages.length && !task.stopped) {
        task.executionStage = task.stages[task.currentStageIndex].name;

        await task.stages[task.currentStageIndex].execution(task);

        if (task.stopped) {
          break;
        }

        const weigtsNextStepTotal = task.stages.reduce((acc, stage, index) => {
          if (index > task.currentStageIndex) {
            return acc;
          }
          return acc + stage.weight;
        }, 0);

        task.progress = weigtsNextStepTotal / calculateTotalWeights(task);
        task.onChange(false);
        task.currentStageIndex++;
      }
    } catch (error) {
      if (error !== CANCELED_STAGE_NAME) {
        getEditorManager().showErrorMessage(`Error in execution: ${error}`);
        console.error('Error in execution', error);
      }

      await mutateStopExecution(task, error instanceof Error ? `Error: ${error.message}` : String(error));
    } finally {
      await mutateStopExecution(task);

      const executionTime = Date.now() - task.startTime;
      const formattedExecutionTime = calculateAndFormatExecutionTime(executionTime);

      mutateAppendToLog(task, `Total Cost: ~${task.totalCost.toFixed(2)}$\n`);
      mutateAppendToLog(task, `${task.executionStage} (Execution Time: ${formattedExecutionTime})\n`);

      task.progress = 1;
    }
  });
}
