import { createFullPromptFromSections } from '../../gpt/createFullPromptFromSections';
import { PromptKnowledge } from '../utils/trimKnowledge';
import { AVAILABLE_COMMANDS } from './codeModificationCommandsPrompt';
import { knowledgeHelperPrompt } from './knowledgeHelperPrompt';

interface PromptData extends PromptKnowledge {
  refCode: string;
  modification: string;
  fileName: string;
}

export const OUTPUT_FORMAT = `

Start your answer with the overview of what you are going to do, and then, follow it by one more COMMANDS.

## General considerations:
* Do not invent your own commands, use only the ones described below.
* After all INSERTS and REPLACEmeents the code should be final, production ready, as described in REQUESTED MODIFICATION.

## Available commands are:
${AVAILABLE_COMMANDS.join('\n\n')}

`.trim();

export const createPrompt = ({ refCode, modification, fileName, knowledge }: PromptData) =>
  createFullPromptFromSections({
    intro: `You are a higly intelligent AI file composer tool, you can take a piece of text and a modification described in natural langue, and return a consolidated answer.`,
    sections: {
      OUTPUT_FORMAT: OUTPUT_FORMAT,
      IMPORTANT_INFORMATIONS: `
              * If you are not sure what is the TASK or TASK details are not specified, try to generate response based on FILENAME: '${fileName}'.
              * ALWAYS use FILENAME as a hint when you answering the question.
              * You have been provided an exact modification (REQUESTED MODIFICATION section) that needs to be applied to the code (ORIGINAL CODE section).
              * Make sure to exactly match the structure of the original and exactly the intention of the modification.
              * You MUST ALWAYS expand all comments like "// ...", "/* remainig code */" or "// ...rest of the code remains the same..." to the exact code that they refer to. You are producting final production ready code, so you need complete code based on ORIGINAL CODE.
              * If in the REQUESTED MODIFICATION section there are only comments, and user asked something that does not requrie modification of the code. Write the answer as a code comment in appropriate spot.
              * You must always leave a mark on the final file, if there is nothing to modify in the file, you must leave a comment in the file describing why there is nothing to modify.
              * Always check if brackets are closed and if code will compile correctly "{" have to end with "}",  "[" have to end with "]" etc.
              * Always check if the final result has all closing commands like END_REPLACE or END_INSERT or END_MODIFY_OTHER
              * Always remember if language is a typed programming language to add proper types to parameters and other variables`.trim(),
      ...knowledgeHelperPrompt(knowledge),
      ORIGINAL_CODE: refCode,
      REQUESTED_MODIFICATION: modification,
    },
    outro: `
            You are a higly intelligent AI file composer tool, you can take a piece of text and a modification described in natural langue, and return a consolidated answer.

            Let's take this step by step, first, describe in detail what you are going to do, and then perform previously described commands in FORMAT OF THE ANSWER section.`.trim(),
  });
