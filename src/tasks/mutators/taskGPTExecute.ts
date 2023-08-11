import { z } from 'zod';
import { DEBUG_RESPONSES } from '../../const';
import { ensureICanRunThis } from '../../gpt/ensureIcanRunThis';
import { gptExecute } from '../../gpt/gptExecute';
import { GPTExecuteRequestPrompt, GPTMode } from '../../gpt/types';
import { TaskContext } from '../TaskContext';
import { mutateAppendToLog } from './mutateAppendToLog';
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
        mutateAppendToLog(task, chunk);
      } else {
        mutateAppendToLog(task, '.');
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

  return result;
}
