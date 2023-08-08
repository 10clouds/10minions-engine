import { Stage } from '../../src/tasks/Stage';
import { TaskContext } from '../../src/tasks/TaskContext';
import { KnowledgeContext } from '../../src/strategyAndKnowledge/KnowledgeContext';
import { StrategyContext } from '../../src/strategyAndKnowledge/StrategyContext';
import { CUSTOM_PRE_STAGES } from './stages';

export class CustomTask implements TaskContext<CustomTask>, StrategyContext<CustomTask>, KnowledgeContext<CustomTask> {
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
    userInput: string;
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
    this.userInput = userInput;
    this.answer = '';
    this.stages = CUSTOM_PRE_STAGES;
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
