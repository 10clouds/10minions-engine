import { z } from 'zod';
import { GPTMode } from '../../src/gpt/types';
import { CustomTask } from './CustomTask';
import { mutateAppendSectionToLog } from '../../src/tasks/mutators/mutateAppendSectionToLog';
import { mutateAppendToLog } from '../../src/tasks/mutators/mutateAppendToLog';
import { mutateGPTExecute } from '../../src/tasks/mutators/mutateGPTExecute';
import { Knowledge } from './Knowledge';
import { createFullPromptFromSections } from '../../src/gpt/createFullPromptFromSections';

export async function mutateCreateCustomAnswer(task: CustomTask, prePrompt: string, availableKnowledge: Knowledge[]): Promise<void> {
  //TODO: Trimming the less relevant knowledge so it still fits into the context window, even if there is too much knowledge selected.

  const fullPrompt = createFullPromptFromSections({
    intro: `${prePrompt}: "${task.userInput}"`,
    sections: Object.fromEntries(
      (task.relevantKnowledgeIds || [])
        .map((knowledgeId) => availableKnowledge.find((k) => k.id === knowledgeId))
        .filter((k) => k)
        .map((k) => [k!.id, k!.content]),
    ),
  });

  task.answer = await mutateGPTExecute(task, {
    fullPrompt: fullPrompt,
    mode: GPTMode.FAST,
    maxTokens: 200,
    outputSchema: z.string(),
  });

  mutateAppendSectionToLog(task, 'Answer');
  mutateAppendToLog(task, task.answer);
}
