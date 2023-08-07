import { z } from 'zod';
import { Knowledge } from '../../../examples/runCustomTask/Knowledge';
import { DEBUG_PROMPTS } from '../../const';
import { GPTExecuteRequestMessage, GPTExecuteRequestPrompt, GPTMode, MODEL_DATA, MODEL_NAMES } from '../../gpt/types';
import { shuffleArray } from '../../utils/random/shuffleArray';
import { Strategy } from '../Strategy';
import { TaskContext } from '../TaskContext';
import { mutateAppendSectionToLog } from './mutateAppendSectionToLog';
import { mutateAppendToLog } from './mutateAppendToLog';
import { mutateGPTExecute } from './mutateGPTExecute';
import { getModel } from '../../gpt/getModel';
import { formatPrompt } from '../../utils/string/formatPrompt';

export async function mutateChooseKnowledgeAndStrategy<T extends TaskContext<T>>({
  task,
  originalCommand,
  originalResult,
  systemDescription = 'AI command center',
  availableStrategies,
  availableKnowledge,
  taskToPrompt,
}: {
  task: T;
  originalCommand?: T;
  originalResult?: string;
  systemDescription: string;
  availableStrategies: Strategy<T>[];
  availableKnowledge: Knowledge[];
  taskToPrompt: (task: T) => Promise<string>;
}) {
  const mode = GPTMode.FAST;

  const promptWithContext: GPTExecuteRequestMessage[] = [
    {
      role: 'system',
      content: formatPrompt(`
        ${systemDescription}

        1. Establish the strategy to execute the command, it can be one of the following values:

        ${shuffleArray(availableStrategies.map((c) => `* ${c.id} - ${c.description}`)).join('\n')}

        2. Figure out and provide a list of materials that are needed to execute the command, and output the sum of tokens for it.

        You may not exceed ${MODEL_DATA[getModel(mode)].maxTokens - 2000} tokens in total.

        Prioritize the most important materials first, as the latter might not fit into the context window.

        Do not add materials if they are not needed.

        You have access to the following materials:

        ${shuffleArray(availableKnowledge.map((c) => `* ${c.id} - ${c.description}`)).join('\n')}

        3. Choose one of the modes: 'FAST' or 'QUALITY'.

        Choose 'QUALITY' if the command requires precise analysis or reasoning.
        Choose 'FAST' for simple tasks that have some leeway in terms of accuracy, like summarisation or creative writing.

        Do not perform the actual command, revise the result or generate any code.
      `),
    },
    ...(originalCommand
      ? ([
          { role: 'user', content: `Original command:\n""" ${await taskToPrompt(originalCommand)} """` },
          { role: 'user', content: `Result that will be revised:\n""" ${originalResult} """` },
          { role: 'user', content: `Request for revision: """ ${await taskToPrompt(task)} """` },
        ] as GPTExecuteRequestMessage[])
      : ([{ role: 'user', content: `Command from the user: """ ${await taskToPrompt(task)} """` }] as GPTExecuteRequestMessage[])),
  ];

  if (DEBUG_PROMPTS) {
    mutateAppendSectionToLog(task, task.executionStage);
    mutateAppendToLog(task, '<<<< PROMPT >>>>\n\n');
    mutateAppendToLog(task, promptWithContext + '\n\n');
    mutateAppendToLog(task, '<<<< EXECUTION >>>>\n\n');
  }

  const result = await mutateGPTExecute(task, {
    fullPrompt: promptWithContext,
    mode,
    maxTokens: 100,
    outputName: 'choose',
    outputSchema: z
      .object({
        relevantMaterials: z.array(z.string()),
        strategy: z.enum([availableStrategies[0].id, ...availableStrategies.slice(1).map((s) => s.id)]),
        mode: z.enum([GPTMode.FAST, GPTMode.QUALITY]),
      })
      .describe('Choose appropriate materials, strategy and mode for the task'),
  });

  mutateAppendToLog(task, '\n\n');

  //find classification in text
  const matchingStrategies = availableStrategies.filter((c) => result.strategy === c.id);

  if (matchingStrategies.length !== 1) {
    throw new Error(`Could not find strategy in the text: ${result}`);
  }

  task.strategyId = matchingStrategies[0].id;

  task.currentStageIndex = task.stages.length - 1;
  task.stages = [...task.stages, ...matchingStrategies[0].stages];

  if (DEBUG_PROMPTS) {
    mutateAppendToLog(task, `Strategy: ${task.strategyId}\n\n`);
  }
}