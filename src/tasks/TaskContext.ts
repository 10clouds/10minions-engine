import { LogContext } from './logs/LogContext';

export interface TaskContext extends LogContext {
  id: string;
  totalCost: number;
  stopped: boolean;

  executionStage: string;
  progress: number;
  stageTargetProgress: number;
  startTime: number;

  onChange: (importantChange: boolean) => Promise<void>;
  onErrorOrCancel?: (error: string) => void;
  onSuccess?: () => void;
}
