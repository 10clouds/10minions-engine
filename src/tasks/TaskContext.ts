import { Stage } from './Stage';

export interface TaskContext<T extends TaskContext<T>> {
  id: string;
  stages: Stage<T>[];
  totalCost: number;
  stopped: boolean;
  currentStageIndex: number;
  onChanged: (important: boolean) => Promise<void>;
  executionStage: string;
  progress: number;
  startTime: number;
  logContent: string;

  rejectProgress?: (error: string) => void;
  resolveProgress?: () => void;
}
