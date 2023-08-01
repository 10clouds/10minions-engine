import { MinionTask } from './MinionTask';
import { TASK_STRATEGIES } from './strategies';

export async function createChooseStrategyPrompt(task: MinionTask) {
  const document = await task.document();

  const fileContext = task.selectedText
    ? `
==== FILE CONTEXT (Language: ${document.languageId}) ====
${task.originalContent}  
`
    : '';

  return `
You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to help him with some code, the task is provided below in TASK section.

Your job is to choose strategy for handling the task, so tomorrow, when you get back to this task, you know what to do.

Possible strategies:
${TASK_STRATEGIES.map((c) => `* ${c.id} - ${c.description}`).join('\n')}

===== CODE ${
    task.selectedText
      ? `(starts on line ${task.selection.start.line + 1} column: ${task.selection.start.character + 1} in the file)`
      : `(Language: ${document.languageId})`
  } ====
${task.selectedText ? task.selectedText : task.originalContent}

${fileContext}

===== TASK (applies to CODE) ====
${task.userQuery}


Choose strategy for the task.
`.trim();
}
