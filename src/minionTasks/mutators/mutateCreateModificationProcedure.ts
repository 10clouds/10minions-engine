import { MinionTask } from '../MinionTask';
import { DEBUG_RESPONSES } from '../../const';
import { mutateAppendToLog } from '../../tasks/mutators/mutateAppendToLog';
import { createModificationProcedure } from '../createModificationProcedure';
import { mutateStopExecution } from '../../tasks/mutators/mutateStopExecution';
import { mutateReportSmallProgress } from '../../tasks/mutators/mutateReportSmallProgress';

export async function mutateCreateModificationProcedure(task: MinionTask) {
  if (task.strategyId === '') {
    throw new Error('Classification is undefined');
  }

  if (task.strategyId === 'AnswerQuestion') {
    return;
  }

  mutateReportSmallProgress(task);

  try {
    const { result, cost } = await createModificationProcedure(
      task.originalContent,
      task.modificationDescription,
      async (chunk: string) => {
        mutateReportSmallProgress(task);
        if (DEBUG_RESPONSES) {
          mutateAppendToLog(task, chunk);
        } else {
          mutateAppendToLog(task, '.');
        }
      },
      () => {
        return task.stopped;
      },
      task.baseName,
    );
    task.modificationProcedure = result;
    task.totalCost += cost;
  } catch (error) {
    mutateAppendToLog(task, `Error while creating modification procedure:\n\n ${error}\n\n`);
    mutateStopExecution(task, (error as Error).message as string);
  }

  mutateAppendToLog(task, '\n\n');
}
