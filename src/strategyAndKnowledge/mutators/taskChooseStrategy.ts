import { z } from 'zod';
import { DEBUG_PROMPTS } from '../../const';
import { GPTMode, MODEL_NAMES } from '../../gpt/types';
import { TaskContext } from '../../tasks/TaskContext';
import { mutateAppendSectionToLog } from '../../tasks/mutators/mutateAppendSectionToLog';
import { mutateAppendToLog } from '../../tasks/mutators/mutateAppendToLog';
import { Strategy } from '../Strategy';
import { taskGPTExecute } from '../../tasks/mutators/taskGPTExecute';
import { shuffleArray } from '../../utils/random/shuffleArray';

export async function taskChooseStrategy<TC extends TaskContext>(task: TC, strategies: Strategy[], taskToPrompt: (task: TC) => Promise<string>) {
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

  const result = await taskGPTExecute(task, {
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

  if (DEBUG_PROMPTS) {
    mutateAppendToLog(task, `Strategy: ${matchingStrategies[0].id}\n\n`);
  }

  return {
    strategy: matchingStrategies[0],
  };
}
