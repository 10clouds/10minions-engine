import { GPTMode } from '../gpt/types';
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
  relevantKnowledgeIds?: string[];

  onChange: (importantChange: boolean) => Promise<void>;
  onErrorOrCancel?: (error: string) => void;
  onSuccess?: () => void;
}
