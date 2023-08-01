import { Stage } from '../../src/tasks/Stage';
import { TaskContext } from '../../src/tasks/TaskContext';
import { CUSTOM_STAGES } from './stages';

export class CustomTask implements TaskContext<CustomTask> {
  id: string;
  stages: Stage<CustomTask>[];
  totalCost: number;
  stopped: boolean;
  currentStageIndex: number;
  onChange: (important: boolean) => Promise<void>;
  executionStage: string;
  progress: number;
  startTime: number;
  logContent: string;
  onErrorOrCancel?: ((error: string) => void) | undefined;
  onSuccess?: (() => void) | undefined;

  constructor({
    id,
    totalCost,
    stopped,
    currentStageIndex,
    onChanged,
    executionStage,
    progress,
    startTime,
    logContent,
    rejectTask: rejectTask,
    resolveTask: resolveTask,
  }: {
    id: string;
    totalCost: number;
    stopped: boolean;
    currentStageIndex: number;
    onChanged: (important: boolean) => Promise<void>;
    executionStage: string;
    progress: number;
    startTime: number;
    logContent: string;
    rejectTask?: ((error: string) => void) | undefined;
    resolveTask?: (() => void) | undefined;
  }) {
    this.id = id;
    this.stages = CUSTOM_STAGES;
    this.totalCost = totalCost;
    this.stopped = stopped;
    this.currentStageIndex = currentStageIndex;
    this.onChange = onChanged;
    this.executionStage = executionStage;
    this.progress = progress;
    this.startTime = startTime;
    this.logContent = logContent;
    this.onErrorOrCancel = rejectTask;
    this.onSuccess = resolveTask;
  }
}
