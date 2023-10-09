import { createFullPromptFromSections } from '../../gpt/createFullPromptFromSections';
import { EditorDocument, EditorPosition } from '../../managers/EditorManager';
import { PromptKnowledge } from '../utils/trimKnowledge';
import { knowledgeHelperPrompt } from './knowledgeHelperPrompt';

export interface PromptData extends PromptKnowledge {
  selectedText: string;
  document: EditorDocument;
  fullFileContents: string;
  selectionPosition: EditorPosition;
  userQuery: string;
  fileName: string;
}

const INTRO = `You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to help him with some code, the task is provided below in TASK section.
Perform that task.

Your job is to do the task, so your college will be exteremely happy. If asked for them, propose changes, deliver insightfull comments in the code and output to the user all of your logic and remarks in nice looking block comment.

Think about what your collegue might have in mind when he wrote his task, and try to fulfill his intention. Try to follow the task as pricesely as possible.

Take this step by step, first describe your plan, then elaborate on each step while providing code that needs to be changed.

Make sure to add a comment to each spot where you are making modifications, so it's clear to the collegue what and where you have modified.

Your collegue will only look at the final code, without you around, so make sure to provide all the necessary comments and explanations in the final code.

If you only modify a section of the code and leave the rest as is, as your final code segment, only output that specific section.

Do not provide the entire file or any bigger chunks than necessary.

You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to help him with some code, the task is provided below in TASK section.
Perform that task.

Your job is to do the task, so your college will be exteremely happy. If asked for them, propose changes, deliver insightfull comments in the code and output to the user all of your logic and remarks in nice looking block comment.`;

export const createPrompt = ({
  selectedText,
  document,
  fullFileContents,
  selectionPosition,
  userQuery,
  fileName,
  knowledge,
}: PromptData) => {
  const settingsKeyword = 'TODO'; //vscode.workspace.getConfiguration('10minions').get('taskCommentKeyword') || "TODO";

  return createFullPromptFromSections({
    intro: INTRO,
    sections: {
      STRATEGIES: `
      If asked to refactor code, critically analyze the provided code and propose a refactoring plan focusing on improving readability and maintainability. Your revised code should remain functional with no change in output or side effects. Suggest renaming functions, creating subroutines, or modifying types as needed, to achieve the aim of simplicity and readability. Ensure your code and any documentation meet the quality standards of a top open source project.  
      If asked to write documentation, write nice comment at the top and consise to the point JSdocs above the signatures of each function.
      If asked to remove comments, don't add your own comments as this is probably not what your college wants.
      If asked to perform a task from a "${settingsKeyword}:" comment, perform the task and remove the comment.`.trim(),
      ...knowledgeHelperPrompt(knowledge),
      CODE_SNIPPET: selectedText
        ? `(starts on line ${selectionPosition.line + 1} column: ${
            selectionPosition.character + 1
          } in the file)`
        : `(Language: ${document.languageId})`,
      SELECTED_TEXT: selectedText ? selectedText : fullFileContents,
      ['TASK (applies to CODE SNIPPET section only, not the entire FILE CONTEXT)']:
        userQuery,
    },
    outro: `
      If the task is not clear or there is lack of details try to generate response base on file name.
      File name: ${fileName}

      Let's take it step by step.`.trim(),
  });
};
