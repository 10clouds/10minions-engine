import { getEditorManager } from '../../managers/EditorManager';
import { TaskContext } from '../TaskContext';
import { calculateTotalWeights } from '../utils/calculateTotalWeights';
import { ShortNameContext, mutateGenerateShortName } from './mutateGenerateShortName';
import { CANCELED_STAGE_NAME } from '../stageNames';
import { mutateStopExecution } from './mutateStopExecution';
import { calculateAndFormatExecutionTime } from '../../utils/calculateAndFormatExecutionTime';
import { mutateAppendToLog } from './mutateAppendToLog';

export function mutateRunTask<T extends TaskContext<T>>(task: T & ShortNameContext) {
  return new Promise<void>(async (resolve, reject) => {
    if (task.stopped) {
      return;
    }

    task.resolveProgress = resolve;
    task.rejectProgress = reject;
    task.currentStageIndex = 0;

    mutateGenerateShortName(task);

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
        task.onChanged(false);
        task.currentStageIndex++;
      }
    } catch (error) {
      if (error !== CANCELED_STAGE_NAME) {
        getEditorManager().showErrorMessage(`Error in execution: ${error}`);
        console.error('Error in execution', error);
      }

      mutateStopExecution(task, error instanceof Error ? `Error: ${error.message}` : String(error));
    } finally {
      const executionTime = Date.now() - task.startTime;
      const formattedExecutionTime = calculateAndFormatExecutionTime(executionTime);

      mutateAppendToLog(task, `${task.executionStage} (Execution Time: ${formattedExecutionTime})\n\n`);

      task.progress = 1;
    }
  });
}
