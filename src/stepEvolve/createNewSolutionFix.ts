import { MinionTaskSolution } from '../minionTasks/advancedCodeChangeStrategy';
import { applyModificationProcedure } from '../minionTasks/applyModificationProcedure';
import { MinionTask } from '../minionTasks/MinionTask';
import { mutateCreateModification } from '../minionTasks/mutators/mutateCreateModification';
import { mutateCreateModificationProcedure } from '../minionTasks/mutators/mutateCreateModificationProcedure';
import { mutateStopExecution } from '../tasks/mutators/mutateStopExecution';

const MAX_ATTEMPTS_NUMBER = 4;

export const createNewSolutionFix = async (
  task: MinionTask,
): Promise<MinionTaskSolution> => {
  task.strategyId = 'CodeChange';
  await mutateCreateModification(task);
  let error = null;
  let modifiedContent = '';
  let iteration = 0;
  do {
    console.log('Create procedure attempt: ', iteration);
    task.stopped = false;
    try {
      await mutateCreateModificationProcedure(task);
      mutateStopExecution(task);
      modifiedContent = await applyModificationProcedure(
        task.originalContent,
        task.modificationProcedure,
        'ts',
      );
    } catch (err) {
      error = err;
    }
    iteration++;
  } while (error && iteration < MAX_ATTEMPTS_NUMBER);

  return {
    resultingCode: modifiedContent,
    modificationProcedure: task.modificationProcedure,
    modificationDescription: task.modificationDescription,
    originalCode: task.originalContent,
  };
};
