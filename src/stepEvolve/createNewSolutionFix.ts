import { mutatorApplyMinionTask } from '../minionTasks/mutators/mutateApplyMinionTask';
import { mutateCreateModification } from '../minionTasks/mutators/mutateCreateModification';
import { mutateCreateModificationProcedure } from '../minionTasks/mutators/mutateCreateModificationProcedure';
import { mutateStopExecution } from '../tasks/mutators/mutateStopExecution';
import { MinionTask } from '../minionTasks/MinionTask';
import { MinionTaskSolution } from '../minionTasks/advancedCodeChangeStrategy';

export const createNewSolutionFix = async (task: MinionTask): Promise<MinionTaskSolution> => {
  task.strategyId = 'AdvancedCodeChange';
  await mutateCreateModification(task);
  await mutateCreateModificationProcedure(task);
  mutateStopExecution(task);
  console.log('Applying new solution...');
  await mutatorApplyMinionTask(task);
  const resultingCode = (await task.document()).getText();

  return {
    resultingCode,
    modificationProcedure: task.modificationProcedure,
    modificationDescription: task.modificationDescription,
  };
};
