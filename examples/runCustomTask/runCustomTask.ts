import { readFileSync } from 'fs';
import { initCLISystems } from '../../src/CLI/setupCLISystems';
import { Knowledge } from '../../src/strategyAndKnowledge/Knowledge';
import { Strategy } from '../../src/strategyAndKnowledge/Strategy';
import { mutateCreateSimpleAnswer } from '../../src/strategyAndKnowledge/mutators/mutateCreateSimpleAnswer';
import { taskChooseKnowledgeAndStrategy } from '../../src/strategyAndKnowledge/mutators/taskChooseKnowledgeAndStrategy';
import { mutateAppendToLog } from '../../src/tasks/mutators/mutateAppendToLog';
import { mutateEndStage } from '../../src/tasks/mutators/mutateEndStage';
import { mutateRunTaskStages } from '../../src/tasks/mutators/mutateRunTaskStages';
import { mutateStartStage } from '../../src/tasks/mutators/mutateStartStage';
import { CustomTask } from './CustomTask';

const USER_INPUT = 'How are you? Can you enumerate the 10Clouds services for me?';
const INTRO = `
This example creates a custom task and runs it while tracking progress.
The task is to first choose a strategy for answering a question, and then to answer the question.
The question is: "${USER_INPUT}"
`;

const CUSTOM_STRATEGIES: Strategy[] = [
  {
    id: 'AnswerWithPolish',
    description: 'Answer with plain text in Polish language',
  },
  {
    id: 'AnswerWithPoem',
    description: 'Choose this if you want to answer with a poem',
  },
  {
    id: 'AnswerWithCode',
    description: 'Choose this if you want to answer with javascript code',
  },
];

const EXAMPLE_KNOWLEDGE: Knowledge[] = [
  {
    id: 'InfoAbout10Clouds',
    description: 'Info About 10Clouds company, use it if you need to know more about the company.',
    content: readFileSync('./examples/runCustomTask/knowledge/info-about-10c.txt', 'utf8'),
  },
  {
    id: 'InfoAboutCEO',
    description: 'Info About CEO of 10Clouds, use it if you need to know more about the CEO.',
    content: readFileSync('./examples/runCustomTask/knowledge/info-about-ceo.txt', 'utf8'),
  },
  {
    id: 'InfoAboutAILabs',
    description: 'Info About AI Labs (formed by 10Clouds), use it if you need to know more about the AI Labs.',
    content: readFileSync('./examples/runCustomTask/knowledge/info-about-ai-labs.txt', 'utf8'),
  },
];

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
    onChanged: async () => {
      console.log('Changed ' + task.progress);
    },
    executionStage: '',
    progress: 0,
    stageTargetProgress: 0,
    startTime: Date.now(),
    logContent: '',
    rejectTask: () => {},
    resolveTask: () => {},
  });

  console.log('Running task ...');
  await mutateRunTaskStages(task, async (task) => {
    mutateStartStage(task, 'Stage 1', 0.5 / 3);
    mutateAppendToLog(task, 'Stage 1' + '\n');
    mutateEndStage(task);

    mutateStartStage(task, 'Stage 2', 0.5 / 3);
    mutateAppendToLog(task, 'Stage 2' + '\n');
    mutateEndStage(task);

    mutateStartStage(task, 'Stage 3: Choose Strategy', 0.5 / 3);
    mutateAppendToLog(task, 'Stage 3: Choose Strategy' + '\n');
    const { strategy, relevantKnowledge } = await taskChooseKnowledgeAndStrategy({
      task,
      systemDescription: 'You are an AI Command Center, capable of writing linkedin posts.',
      availableStrategies: CUSTOM_STRATEGIES,
      availableKnowledge: EXAMPLE_KNOWLEDGE,
      taskToPrompt: async (task: CustomTask) => {
        return `User typed in "${task.userInput}"`;
      },
    });

    task.relevantKnowledgeIds = relevantKnowledge.map((knowledge) => knowledge.id);
    task.strategyId = strategy.id;
    task.onChange(true);

    mutateEndStage(task);

    switch (strategy.id) {
      case 'AnswerWithPolish':
        mutateStartStage(task, 'Stage 4 (AnswerWithPolish)', 0.5);
        mutateAppendToLog(task, 'Stage 4 (AnswerWithPolish)' + '\n');
        task.answer = await mutateCreateSimpleAnswer({
          task,
          prePrompt: 'Answer to this in Polish language',
          input: task.userInput,
          relevantKnowledge,
        });
        task.onChange(true);
        mutateEndStage(task);
        break;
      case 'AnswerWithPoem':
        mutateStartStage(task, 'Stage 4 (AnswerWithPolish)', 0.5);
        mutateAppendToLog(task, 'Stage 4 (AnswerWithPolish)' + '\n');
        task.answer = await mutateCreateSimpleAnswer({
          task,
          prePrompt: 'Answer to this with a poem',
          input: task.userInput,
          relevantKnowledge,
        });
        task.onChange(true);
        mutateEndStage(task);
        break;
      case 'AnswerWithCode':
        mutateStartStage(task, 'Stage 4 (AnswerWithCode)', 0.5);
        mutateAppendToLog(task, 'Stage 4 (AnswerWithCode)' + '\n');
        task.answer = await mutateCreateSimpleAnswer({
          task,
          prePrompt: 'Answer to this as Javascript code',
          input: task.userInput,
          relevantKnowledge,
        });
        task.onChange(true);
        mutateEndStage(task);
        break;
    }
  });

  console.log(task.logContent);
  console.log('Done');
})();
