import { createFullPromptFromSections } from '../../gpt/createFullPromptFromSections';
import { EditorDocument, EditorPosition } from '../../managers/EditorManager';
import { PromptKnowledge } from '../utils/trimKnowledge';
import { knowledgeHelperPrompt } from './knowledgeHelperPrompt';

interface PromptData extends PromptKnowledge {
  selectedText: string;
  document: EditorDocument;
  fullFileContents: string;
  selectionPosition: EditorPosition;
  userQuery: string;
  fileName: string;
}

export const createPrompt = ({ selectedText, document, fullFileContents, selectionPosition, userQuery, fileName, knowledge }: PromptData) =>
  createFullPromptFromSections({
    intro: `
You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to tell him about something, the task is provided below in TASK section.
Perform that task.

Your job is to professionally answer the question.

Think about what your collegue might have in mind when he wrote his task, and try to fulfill his intention. Try to follow the task as pricesely as possible.

Take this step by step, and describe your reasoning along the way.

At the end provide your final answer, this is the only thing that will be supplied to your collegue as a result of this task.
    `.trim(),
    sections: {
      ...(selectedText ? { [`FILE CONTEXT (Language: ${document.languageId})`]: fullFileContents } : {}),

      [`CODE SNIPPET ${
        selectedText
          ? `(starts on line ${selectionPosition.line + 1} column: ${selectionPosition.character + 1} in the file)`
          : `(Language: ${document.languageId})`
      }`]: selectedText ? selectedText : fullFileContents,
      [`TASK (applies to CODE SNIPPET section only, not the entire FILE CONTEXT)`]: userQuery,
      ...knowledgeHelperPrompt(knowledge),
    },
    outro: `
If the task is not clear or there is lack of details try to generate response base on file name.
File name: ${fileName}

Let's take it step by step.
`.trim(),
  });
