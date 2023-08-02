import { z } from 'zod';
import { DEBUG_PROMPTS } from '../../const';
import { GPTMode, MODEL_NAMES } from '../../gpt/types';
import { TaskContext } from '../TaskContext';
import { mutateAppendSectionToLog } from './mutateAppendSectionToLog';
import { mutateAppendToLog } from './mutateAppendToLog';
import { Strategy } from '../Strategy';
import { mutateGPTExecute } from './mutateGPTExecute';
import { shuffleArray } from '../../utils/random/shuffleArray';

export async function mutateStageChooseStrategy<T extends TaskContext<T>>(task: T, strategies: Strategy<T>[], taskToPrompt: (task: T) => Promise<string>) {
  const promptWithContext = `
${await taskToPrompt(task)}

Possible strategies:
${shuffleArray(strategies.map((c) => `* ${c.id} - ${c.description}`)).join('\n')}

Now choose strategy for the task.
`.trim();

  if (DEBUG_PROMPTS) {
    mutateAppendSectionToLog(task, task.executionStage);
    mutateAppendToLog(task, '<<<< PROMPT >>>>\n\n');
    mutateAppendToLog(task, promptWithContext + '\n\n');
    mutateAppendToLog(task, '<<<< EXECUTION >>>>\n\n');
  }

  const result = await mutateGPTExecute(task, {
    fullPrompt: promptWithContext,
    mode: GPTMode.FAST,
    maxTokens: 50,
    outputName: 'chooseStrategy',
    outputSchema: z
      .object({
        relevantKnowledge: z.array(z.string()),
        strategy: z.enum([strategies[0].id, ...strategies.slice(1).map((s) => s.id)]),
        model: z.enum([MODEL_NAMES[0], ...MODEL_NAMES.slice(1)]),
      })
      .describe('Choose appropriate strategy'),
  });

  mutateAppendToLog(task, '\n\n');

  //find classification in text
  const matchingStrategies = strategies.filter((c) => result.strategy === c.id);

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