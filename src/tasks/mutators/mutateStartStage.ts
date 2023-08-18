import { TaskContext } from '../TaskContext';

export function mutateStartStage({
  task,
  name,
  progressIncrement = 0.01,
  progress,
}: {
  task: TaskContext;
  name: string;
  progressIncrement?: number;
  progress?: number;
}) {
  task.stageTargetProgress = Math.min(1.0, progress !== undefined ? progress : task.progress + progressIncrement);
  task.executionStage = name;
}
