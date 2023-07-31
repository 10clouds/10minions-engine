import { z } from 'zod';
import { gptExecute } from '../../gpt/gptExecute';
import { GPTMode } from '../../gpt/types';
import { TaskContext as TaskContext } from '../TaskContext';

export interface ShortNameContext {
  shortName: string;
  userQuery: string;
  baseName: string;
  selectedText: string;
}

export async function mutateGenerateShortName<T extends TaskContext<T>>(task: TaskContext<T> & ShortNameContext) {
  task.shortName = '...';
  task.onChanged(true);

  const context = task.selectedText
    ? `
==== WHAT USER SELECTED ====
${task.selectedText}
      `.trim()
    : `
==== WHAT IS THE NAME OF THE FILE ====
${task.baseName}    
      `.trim();

  await gptExecute({
    mode: GPTMode.FAST,
    maxTokens: 20,
    fullPrompt: `
User just created a task, he said what the task is, but also selected the code and file this task refers to.
Create a very short summary of what the task is in it's essence.
Maximum of 20 characters. You MUST not exceed this number.
Try to combine info from what user said and what user selected and file name.
If a selected identifier is too long or file name is too long, just use some keywords from it.
You can abbreviate words if needed.

==== WHAT USER SAID ====
${task.userQuery}

${context}
      
      `.trim(),
    outputSchema: z.string(),
  }).then(({ result, cost }) => {
    task.shortName = result || task.baseName;
    task.totalCost += cost;
    task.onChanged(true);
  });
}
