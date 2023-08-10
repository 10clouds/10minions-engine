import { TaskContext } from '../TaskContext';

export function mutateStartStage(task: TaskContext, name: string, progressIncrement: number) {
  task.stageTargetProgress = Math.min(1.0, task.progress + progressIncrement);
  task.executionStage = name;
}
