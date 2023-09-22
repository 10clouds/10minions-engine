import { MinionTask } from '../MinionTask';
import { DEBUG_RESPONSES } from '../../const';
import { mutateAppendToLog } from '../../tasks/logs/mutators/mutateAppendToLog';
import { mutateAppendToLogNoNewline } from '../../tasks/logs/mutators/mutateAppendToLogNoNewline';
import { createModificationProcedure } from '../createModificationProcedure';
import { mutateStopExecution } from '../../tasks/mutators/mutateStopExecution';
import { mutateReportSmallProgress } from '../../tasks/mutators/mutateReportSmallProgress';

export async function mutateCreateModificationProcedure(task: MinionTask) {
  const { strategyId, originalContent, modificationDescription, baseName, relevantKnowledge, stopped } = task;
  if (strategyId === '') {
    throw new Error('Classification is undefined');
  }

  if (strategyId === 'AnswerQuestion') {
    return;
  }

  mutateReportSmallProgress(task);

  try {
    const { result, cost } = await createModificationProcedure(
      originalContent,
      modificationDescription,
      async (chunk: string) => {
        mutateReportSmallProgress(task);
        if (DEBUG_RESPONSES) {
          mutateAppendToLogNoNewline(task, chunk);
        } else {
          mutateAppendToLogNoNewline(task, '.');
        }
      },
      () => {
        return stopped;
      },
      baseName,
      relevantKnowledge,
    );

    task.modificationProcedure = result;
    task.totalCost += cost;
  } catch (error) {
    mutateAppendToLogNoNewline(task, `Error while creating modification procedure:\n\n ${error}\n\n`);
    mutateStopExecution(task, (error as Error).message as string);
  }

  mutateAppendToLog(task, '');
}
