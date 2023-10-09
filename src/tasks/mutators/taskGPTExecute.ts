import { z } from 'zod';

import { DEBUG_RESPONSES } from '../../const';
import { ensureICanRunThis } from '../../gpt/ensureIcanRunThis';
import { gptExecute } from '../../gpt/gptExecute';
import { GPTExecuteRequestPrompt, GPTMode } from '../../gpt/types';
import { mutateAppendToLog } from '../logs/mutators/mutateAppendToLog';
import { mutateAppendToLogNoNewline } from '../logs/mutators/mutateAppendToLogNoNewline';
import { TaskContext } from '../TaskContext';
import { mutateReportSmallProgress } from './mutateReportSmallProgress';

export async function taskGPTExecute<OutputTypeSchema extends z.ZodType>(
  task: TaskContext,
  {
    fullPrompt,
    maxTokens = 2000,
    mode,
    temperature = 1,
    outputSchema,
    outputName = 'output',
    controller,
  }: {
    fullPrompt: GPTExecuteRequestPrompt;
    maxTokens?: number;
    mode: GPTMode;
    temperature?: number;
    controller?: AbortController;
    outputSchema: OutputTypeSchema;
    outputName?: string;
  },
): Promise<z.infer<OutputTypeSchema>> {
  ensureICanRunThis({ prompt: fullPrompt, maxTokens, mode });

  const { result, cost } = await gptExecute({
    fullPrompt,
    onChunk: async (chunk: string) => {
      mutateReportSmallProgress(task);
      if (DEBUG_RESPONSES) {
        mutateAppendToLogNoNewline(task, chunk);
      } else {
        mutateAppendToLogNoNewline(task, '.');
      }
    },
    isCancelled: () => {
      return task.stopped;
    },
    maxTokens,
    mode,
    controller,
    outputName,
    outputSchema,
    temperature,
  });

  mutateAppendToLog(task, '');
  mutateAppendToLog(task, '');

  task.totalCost += cost;

  return result as Promise<z.infer<OutputTypeSchema>>;
}
