import { z } from 'zod';
import { GPTMode } from '../../src/gpt/types';
import { CustomTask } from './CustomTask';
import { mutateAppendSectionToLog } from '../../src/tasks/mutators/mutateAppendSectionToLog';
import { mutateAppendToLog } from '../../src/tasks/mutators/mutateAppendToLog';
import { mutateGPTExecute } from '../../src/tasks/mutators/mutateGPTExecute';

export async function mutateCreateCustomAnswer(task: CustomTask, prePrompt: string): Promise<void> {
  task.answer = await mutateGPTExecute(task, {
    fullPrompt: `${prePrompt}: "${task.userInput}"`,
    mode: GPTMode.FAST,
    maxTokens: 200,
    outputSchema: z.string(),
  });

  mutateAppendSectionToLog(task, 'Answer');
  mutateAppendToLog(task, task.answer);
}
