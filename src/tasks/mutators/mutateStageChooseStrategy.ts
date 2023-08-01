import { z } from 'zod';
import { DEBUG_PROMPTS, DEBUG_RESPONSES } from '../../const';
import { ensureICanRunThis } from '../../gpt/ensureIcanRunThis';
import { gptExecute } from '../../gpt/gptExecute';
import { GPTMode, MODEL_NAMES } from '../../gpt/types';
import { TaskContext } from '../TaskContext';
import { mutateAppendSectionToLog } from './mutateAppendSectionToLog';
import { mutateAppendToLog } from './mutateAppendToLog';
import { mutateReportSmallProgress } from './mutateReportSmallProgress';
import { Strategy } from '../Strategy';

export async function mutateStageChooseStrategy<T extends TaskContext<T>>(task: T, strategies: Strategy<T>[], taskToPrompt: (task: T) => Promise<string>) {
  const promptWithContext = `
${taskToPrompt(task)}

Choose strategy for the task.
`.trim();

  if (DEBUG_PROMPTS) {
    mutateAppendSectionToLog(task, task.executionStage);
    mutateAppendToLog(task, '<<<< PROMPT >>>>\n\n');
    mutateAppendToLog(task, promptWithContext + '\n\n');
    mutateAppendToLog(task, '<<<< EXECUTION >>>>\n\n');
  }

  ensureICanRunThis({ prompt: promptWithContext, maxTokens: 50, mode: GPTMode.FAST });

  const { result, cost } = await gptExecute({
    fullPrompt: promptWithContext,
    onChunk: async (chunk: string) => {
      mutateReportSmallProgress(task);
      if (DEBUG_RESPONSES) {
        mutateAppendToLog(task, chunk);
      } else {
        mutateAppendToLog(task, '.');
      }
    },
    isCancelled: () => {
      return task.stopped;
    },
    maxTokens: 50,
    mode: GPTMode.FAST,
    controller: new AbortController(),
    outputName: 'classification',
    outputSchema: z
      .object({
        relevantKnowledge: z.array(z.string()),
        strategy: z.enum([strategies[0].id, ...strategies.slice(1).map(s => s.id)]),
        model: z.enum([MODEL_NAMES[0], ...MODEL_NAMES.slice(1)]),
      })
      .describe('Classification'),
  });

  task.totalCost += cost;

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
