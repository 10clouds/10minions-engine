import { initCLISystems } from '../../src/CLI/setupCLISystems';
import { mutateRunTask } from '../../src/tasks/mutators/mutateRunTask';
import { CustomTask } from './CustomTask';

const INTRO = `
This example creates a custom task and runs it while tracking progress.
`;

(async function () {
  console.log(INTRO);

  console.log('Initiating ...');
  initCLISystems();

  console.log('Creating task ...');
  const task = new CustomTask({
    id: '1',
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
    rejectTask: () => {},
    resolveTask: () => {},
  });

  console.log('Running task ...');
  await mutateRunTask(task);
  console.log(task.logContent);

  console.log('Done');
})();
