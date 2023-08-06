import { TaskContext } from '../TaskContext';
import { calculateTotalWeights } from '../utils/calculateTotalWeights';

export function mutateReportSmallProgress<T extends TaskContext<T>>(task: T, fractionOfBigTask = 0.005) {
  const weigtsNextStepTotal = task.stages.reduce((acc, stage, index) => {
    if (index > task.currentStageIndex) {
      return acc;
    }
    return acc + stage.weight;
  }, 0);

  const remainingProgress = (1.0 * weigtsNextStepTotal) / calculateTotalWeights(task);
  const currentProgress = task.progress;

  const totalPending = remainingProgress - currentProgress;
  const increment = totalPending * fractionOfBigTask;
  task.progress = task.progress + increment;
  task.onChange(false);
}
