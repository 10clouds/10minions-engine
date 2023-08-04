import { Stage } from './Stage';

export interface TaskContext<T extends TaskContext<T>> {
  id: string;
  stages: Stage<T>[];
  totalCost: number;
  stopped: boolean;
  currentStageIndex: number;

  executionStage: string;
  progress: number;
  startTime: number;
  logContent: string;

  strategyId?: string;
  //TODO: relevantKnowledge, when knowledge is implemented

  onChange: (importantChange: boolean) => Promise<void>;
  onErrorOrCancel?: (error: string) => void;
  onSuccess?: () => void;
}
