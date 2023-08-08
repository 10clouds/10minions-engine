import { initCLISystems } from '../../src/CLI/setupCLISystems';
import { mutateRunTask } from '../../src/tasks/mutators/mutateRunTask';
import { CustomTask } from './CustomTask';

const USER_INPUT = 'How are you? Can you enumerate the 10Clouds services for me?';
const INTRO = `
This example creates a custom task and runs it while tracking progress.
The task is to first choose a strategy for answering a question, and then to answer the question.
The question is: "${USER_INPUT}"
`;

(async function () {
  console.log(INTRO);

  console.log('Initiating ...');
  initCLISystems();

  console.log('Creating task ...');
  const task = new CustomTask({
    userInput: USER_INPUT,
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
