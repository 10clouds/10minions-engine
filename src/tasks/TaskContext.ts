import { GPTMode } from '../gpt/types';
import { Stage } from './Stage';

export interface TaskContext<TC extends TaskContext<TC>> {
  id: string;
  stages: Stage<TC>[];
  totalCost: number;
  stopped: boolean;
  currentStageIndex: number;

  executionStage: string;
  progress: number;
  startTime: number;
  logContent: string;

  onChange: (importantChange: boolean) => Promise<void>;
  onErrorOrCancel?: (error: string) => void;
  onSuccess?: () => void;
}
