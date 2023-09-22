import { z } from 'zod';
import { Knowledge } from '../Knowledge';
import { DEBUG_PROMPTS } from '../../const';
import { getModel } from '../../gpt/getModel';
import { GPTExecuteRequestMessage, GPTMode, MODEL_DATA } from '../../gpt/types';
import { shuffleArray } from '../../utils/random/shuffleArray';
import { formatPrompt } from '../../utils/string/formatPrompt';
import { Strategy } from '../Strategy';
import { TaskContext } from '../../tasks/TaskContext';
import { mutateAppendSectionToLog } from '../../tasks/logs/mutators/mutateAppendSectionToLog';
import { mutateAppendToLog } from '../../tasks/logs/mutators/mutateAppendToLog';
import { taskGPTExecute } from '../../tasks/mutators/taskGPTExecute';
import { countTokens } from '../../gpt/countTokens';
import { ensureIRunThisInRange } from '../../gpt/ensureIRunThisInRange';

export async function taskChooseKnowledgeAndStrategy<TC extends TaskContext>({
  task,
  originalCommand,
  originalResult,
  systemDescription = 'AI command center',
  availableStrategies,
  availableKnowledge,
  taskToPrompt,
}: {
  task: TC;
  originalCommand?: TC;
  originalResult?: string;
  systemDescription: string;
  availableStrategies: Strategy[];
  availableKnowledge: Knowledge[];
  taskToPrompt: (task: TC) => Promise<string>;
}) {
  const taskPrompt = await taskToPrompt(originalCommand ?? task);
  const mode = GPTMode.FAST;
  const isKnowledge = Boolean(availableKnowledge.length);

  const promptWithContext: GPTExecuteRequestMessage[] = [
    {
      role: 'system',
      content: formatPrompt(`
        ${systemDescription}

        1. Establish the strategy to execute the command, it can be one of the following values:

        ${shuffleArray(availableStrategies.map((c) => `* ${c.id} - ${c.description}`)).join('\n        ')}

        2. Figure out and provide a list of materials that are needed to execute the command, and output the sum of tokens for it.

        You may not exceed ${MODEL_DATA[getModel(mode)].maxTokens - 2000} tokens in total.

        Prioritize the most important materials first, as the latter might not fit into the context window.

        Do not add materials if they are not needed.
       
        You have access to the following materials:

        ${isKnowledge ? shuffleArray(availableKnowledge.map((c) => `* ${c.id} - ${c.description} `)).join('\n        ') : ''}

        Do not perform the actual command, revise the result or generate any code.
      `),
    },
    ...(originalCommand
      ? ([
          { role: 'user', content: `Original command:\n""" ${taskPrompt} """` },
          { role: 'user', content: `Result that will be revised:\n""" ${originalResult} """` },
          { role: 'user', content: `Request for revision: """ ${taskPrompt} """` },
        ] as GPTExecuteRequestMessage[])
      : ([{ role: 'user', content: `Command from the user: """ ${taskPrompt} """` }] as GPTExecuteRequestMessage[])),
  ];

  if (DEBUG_PROMPTS) {
    mutateAppendSectionToLog(task, task.executionStage);
    mutateAppendToLog(task, '<<<< PROMPT >>>>');
    mutateAppendToLog(task, '');
    mutateAppendToLog(task, promptWithContext.map((m) => m.content).join(','));
    mutateAppendToLog(task, '');
    mutateAppendToLog(task, '<<<< EXECUTION >>>>');
    mutateAppendToLog(task, '');
  }
  const prompt = JSON.stringify(promptWithContext);
  const minTokens = countTokens(taskPrompt, mode) + 500;
  const fullPromptTokens = countTokens(prompt, mode) + 500;

  const maxTokens = ensureIRunThisInRange({
    prompt,
    mode: mode,
    preferedTokens: fullPromptTokens,
    minTokens: minTokens,
  });

  const result = await taskGPTExecute(task, {
    fullPrompt: promptWithContext,
    mode,
    maxTokens,
    outputName: 'choose',
    outputSchema: z
      .object({
        neededKnowledge: z.array(z.enum([availableKnowledge[0].id, ...availableKnowledge.slice(1).map((s) => s.id)])),
        strategy: z.enum([availableStrategies[0].id, ...availableStrategies.slice(1).map((s) => s.id)]),
      })
      .describe('Choose needed knowledge and strategy for the task'),
  });

  mutateAppendToLog(task, '\n');

  //find classification in text
  const matchingStrategies = availableStrategies.filter((c) => result.strategy === c.id);

  if (matchingStrategies.length !== 1) {
    throw new Error(`Could not find strategy in the text: ${result}`);
  }

  const pickedStrategy = matchingStrategies[0];

  if (DEBUG_PROMPTS) {
    mutateAppendToLog(task, `Strategy: ${pickedStrategy.id}\n`);
  }

  const relevantKnowledge = (result.neededKnowledge || [])
    .map((knowledgeId) => availableKnowledge.find((k) => k.id === knowledgeId))
    .filter((k) => k !== undefined) as Knowledge[]; //TODO: Error checking

  return {
    strategy: matchingStrategies[0],
    relevantKnowledge,
  };
}
