import { TaskContext } from '../../src/tasks/TaskContext';

export class CustomTask implements TaskContext {
  id: string;
  totalCost: number;
  stopped: boolean;
  onChange: (important: boolean) => Promise<void>;
  executionStage: string;
  progress: number;
  stageTargetProgress: number;
  startTime: number;
  logContent: string;
  onErrorOrCancel?: ((error: string) => void) | undefined;
  onSuccess?: (() => void) | undefined;
  strategyId = '';
  relevantKnowledgeIds: string[] = [];

  //custom
  userInput: string;
  answer: string;

  constructor({
    id,
    userInput,
    totalCost,
    stopped,
    onChanged,
    executionStage,
    progress,
    stageTargetProgress,
    startTime,
    logContent,
    rejectTask,
    resolveTask,
  }: {
    id: string;
    userInput: string;
    totalCost: number;
    stopped: boolean;
    onChanged: (important: boolean) => Promise<void>;
    executionStage: string;
    progress: number;
    stageTargetProgress: number;
    startTime: number;
    logContent: string;
    rejectTask?: ((error: string) => void) | undefined;
    resolveTask?: (() => void) | undefined;
  }) {
    this.id = id;
    this.userInput = userInput;
    this.answer = '';
    this.totalCost = totalCost;
    this.stopped = stopped;
    this.onChange = onChanged;
    this.executionStage = executionStage;
    this.progress = progress;
    this.stageTargetProgress = stageTargetProgress;
    this.startTime = startTime;
    this.logContent = logContent;
    this.onErrorOrCancel = rejectTask;
    this.onSuccess = resolveTask;
  }
}
