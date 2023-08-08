import { z } from 'zod';
import { GPTMode } from '../../gpt/types';
import { mutateAppendSectionToLog } from '../../tasks/mutators/mutateAppendSectionToLog';
import { mutateAppendToLog } from '../../tasks/mutators/mutateAppendToLog';
import { taskGPTExecute } from '../../tasks/mutators/taskGPTExecute';
import { Knowledge } from '../Knowledge';
import { createFullPromptFromSections } from '../../gpt/createFullPromptFromSections';
import { TaskContext } from '../../tasks/TaskContext';
import { KnowledgeContext } from '../KnowledgeContext';
import { StringProperties, setStringValue } from '../../utils/genericPropertyTypes';

export async function mutateCreateSimpleAnswer<TC extends TaskContext<TC> & KnowledgeContext<TC>>({
  task,
  prePrompt,
  inputField,
  outputField,
  availableKnowledge,
}: {
  task: TC;
  prePrompt: string;
  inputField: StringProperties<TC>;
  outputField: StringProperties<TC>;
  availableKnowledge: Knowledge[];
}): Promise<void> {
  //TODO: Trimming the less relevant knowledge so it still fits into the context window, even if there is too much knowledge selected.

  const fullPrompt = createFullPromptFromSections({
    intro: `${prePrompt}: "${task[inputField]}"`,
    sections: Object.fromEntries(
      (task.relevantKnowledgeIds || [])
        .map((knowledgeId) => availableKnowledge.find((k) => k.id === knowledgeId))
        .filter((k) => k)
        .map((k) => [k!.id, k!.content]),
    ),
  });

  setStringValue(
    task,
    outputField,
    await taskGPTExecute(task, {
      fullPrompt: fullPrompt,
      mode: GPTMode.QUALITY,
      maxTokens: 400,
      outputSchema: z.string(),
    }),
  );

  mutateAppendSectionToLog(task, 'Answer');
  mutateAppendToLog(task, task[outputField] as string); //TODO: Is there a way to avoid this as string?
}
