export interface TaskContext {
  id: string;
  totalCost: number;
  stopped: boolean;

  executionStage: string;
  progress: number;
  stageTargetProgress: number;
  startTime: number;
  logContent: string;

  onChange: (importantChange: boolean) => Promise<void>;
  onErrorOrCancel?: (error: string) => void;
  onSuccess?: () => void;
}
