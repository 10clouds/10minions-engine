import { createFullPromptFromSections } from '../gpt/utils/createFullPromptFromSections';
import { MinionTask } from './MinionTask';

export async function createChooseStrategyPrompt(task: MinionTask) {
  const document = await task.document();

  return createFullPromptFromSections({
    intro: `
You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your colleague asked you to help him with some code, the task is provided below in TASK section.

To choose the most accurate files take a look on imports in CODE section in the first place.

Your job is to choose strategy and best materials for handling the TASK, so tomorrow, when you get back to this TASK, you know what to do.
`.trim(),
    sections: {
      ...(task.selectedText
        ? {
            [`CODE (starts on line ${task.selection.start.line + 1} column: ${
              task.selection.start.character + 1
            } in the file)`]: task.selectedText,
            [`FILE CONTEXT (Language: ${document.languageId})`]:
              task.getOriginalContent,
          }
        : {
            [`CODE (Language: ${document.languageId})`]:
              task.getOriginalContent,
          }),
      [`TASK (applies to CODE)`]: task.userQuery,
    },
    outro: ``,
  });
}
