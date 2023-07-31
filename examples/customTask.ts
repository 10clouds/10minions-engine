import { initCLISystems } from '../src/CLI/setupCLISystems';
import { Stage } from '../src/tasks/Stage';
import { TaskContext } from '../src/tasks/TaskContext';
import { mutateRunTask } from '../src/tasks/mutators/mutateRunTask';

const INTRO = `
This example creates a custom task and runs it while tracking progress.
`;

class BasicTask implements TaskContext<BasicTask> {
  id: string;
  stages: Stage<BasicTask>[];
  totalCost: number;
  stopped: boolean;
  currentStageIndex: number;
  onChanged: (important: boolean) => Promise<void>;
  executionStage: string;
  progress: number;
  startTime: number;
  logContent: string;
  rejectProgress?: ((error: string) => void) | undefined;
  resolveProgress?: (() => void) | undefined;

  constructor({
    id,
    stages,
    totalCost,
    stopped,
    currentStageIndex,
    onChanged,
    executionStage,
    progress,
    startTime,
    logContent,
    rejectProgress,
    resolveProgress,
  }: {
    id: string;
    stages: Stage<BasicTask>[];
    totalCost: number;
    stopped: boolean;
    currentStageIndex: number;
    onChanged: (important: boolean) => Promise<void>;
    executionStage: string;
    progress: number;
    startTime: number;
    logContent: string;
    rejectProgress?: ((error: string) => void) | undefined;
    resolveProgress?: (() => void) | undefined;
  }) {
    this.id = id;
    this.stages = stages;
    this.totalCost = totalCost;
    this.stopped = stopped;
    this.currentStageIndex = currentStageIndex;
    this.onChanged = onChanged;
    this.executionStage = executionStage;
    this.progress = progress;
    this.startTime = startTime;
    this.logContent = logContent;
    this.rejectProgress = rejectProgress;
    this.resolveProgress = resolveProgress;
  }
}

(async function () {
  console.log(INTRO);

  console.log('Initiating ...');
  initCLISystems();

  console.log('Creating task ...');
  const task = new BasicTask({
    id: '1',
    stages: [
      {
        name: 'Stage 1',
        weight: 100,
        execution: async (task) => {
          console.log('Stage 1');
        },
      },
      {
        name: 'Stage 2',
        weight: 100,
        execution: async (task) => {
          console.log('Stage 2');
        },
      },
      {
        name: 'Stage 3',
        weight: 100,
        execution: async (task) => {
          console.log('Stage 3');
        },
      },
    ],
    totalCost: 0,
    stopped: false,
    currentStageIndex: 0,
    onChanged: async () => {
      console.log('Changed ' + task.progress);
    },
    executionStage: '',
    progress: 0,
    startTime: Date.now(),
    logContent: '',
    rejectProgress: () => {},
    resolveProgress: () => {},
  });

  console.log('Running task ...');
  await mutateRunTask(task);
  console.log(task.logContent);

  console.log('Done');
})();
