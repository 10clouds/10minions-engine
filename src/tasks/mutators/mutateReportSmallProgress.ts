import { TaskContext } from '../TaskContext';

export function mutateReportSmallProgress(
  task: TaskContext,
  fractionOfBigTask = 0.005,
) {
  const totalPending = task.stageTargetProgress - task.progress;
  const increment = totalPending * fractionOfBigTask;
  task.progress = task.progress + increment;
  task.onChange(false);
}
