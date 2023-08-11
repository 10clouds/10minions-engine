import { z } from 'zod';
import { createFullPromptFromSections } from '../../gpt/createFullPromptFromSections';
import { GPTMode } from '../../gpt/types';
import { TaskContext } from '../../tasks/TaskContext';
import { mutateAppendSectionToLog } from '../../tasks/mutators/mutateAppendSectionToLog';
import { mutateAppendToLogNoNewline } from '../../tasks/mutators/mutateAppendToLogNoNewline';
import { taskGPTExecute } from '../../tasks/mutators/taskGPTExecute';
import { Knowledge } from '../Knowledge';

export async function mutateCreateSimpleAnswer<TC extends TaskContext>({
  task,
  prePrompt,
  input,
  relevantKnowledge,
}: {
  task: TC;
  prePrompt: string;
  input: string;
  relevantKnowledge: Knowledge[];
}): Promise<string> {
  //TODO: Trimming the less relevant knowledge so it still fits into the context window, even if there is too much knowledge selected.

  const fullPrompt = createFullPromptFromSections({
    intro: `${prePrompt}: "${input}"`,
    sections: Object.fromEntries(relevantKnowledge.map((k) => [k.id, k.content])),
  });

  const answer = await taskGPTExecute(task, {
    fullPrompt: fullPrompt,
    mode: GPTMode.QUALITY,
    maxTokens: 400,
    outputSchema: z.string(),
  });

  mutateAppendSectionToLog(task, 'Answer');
  mutateAppendToLogNoNewline(task, answer);

  return answer;
}
