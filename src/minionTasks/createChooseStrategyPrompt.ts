import { createFullPromptFromSections } from '../gpt/createFullPromptFromSections';
import { MinionTask } from './MinionTask';
import { TASK_STRATEGIES } from './strategies';

export async function createChooseStrategyPrompt(task: MinionTask) {
  const document = await task.document();

  return createFullPromptFromSections({
    intro: `
You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to help him with some code, the task is provided below in TASK section.

Your job is to choose strategy for handling the task, so tomorrow, when you get back to this task, you know what to do.
`.trim(),
    sections: {
      ...(task.selectedText
        ? {
            [`CODE (starts on line ${task.selection.start.line + 1} column: ${task.selection.start.character + 1} in the file)`]: task.selectedText,
            [`FILE CONTEXT (Language: ${document.languageId})`]: task.originalContent,
          }
        : {
            [`CODE (Language: ${document.languageId})`]: task.originalContent,
          }),
      [`TASK (applies to CODE)`]: task.userQuery,
    },
    outro: ``,
  });
}
