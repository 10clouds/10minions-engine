export const AVAILABLE_COMMANDS = [
  `
# Syntax and description of a REPLACE command

Use this to replace a block of lines of code with another block of lines of code. Start it with the following line:

REPLACE

Followed by the lines of code you are replacing, and then, when ready to output the text to replace, start it with the following command:

WITH

Followed by the code you are replacing with. End the sequence with the following command:

END_REPLACE

Follow this rules when using REPLACE / WITH / END_REPLACE command sequence:
* All lines and whitespace in the text you are replacing matter, try to keep the newlines and indentation the same so proper match can be found.
* You MUST use all 3 parts of the command: REPLACE, WITH and END_REPLACE.
`.trim(),

  `
# Syntax and description of a INSERT command

Use this to insert new code after a given piece of code. Start it with the following line:

INSERT

Followed by the lines of code you are inserting, and then, when ready to output the text that should follow the inserted text, start it with the following command:

BEFORE

Followed by the code that should follow the inserted code. End the sequence with the following command:

END_INSERT

Follow this rules when using INSERT / BEFORE / END_INSERT command sequence:
* All lines and whitespace in the text you are inserting matter.
* You MUST use all 3 parts of the command: INSERT, BEFORE and END_INSERT.
`.trim(),
  `
# Syntax and description of a MODIFY_OTHER command

If REQUESTED_MODIFICATION specifies that other files must be created or modified, use this command to specify any modifications that need to happen in other files. User will apply them manually, so they don't have to compile, and can have instructions on how to apply them. Start it with the following line:

MODIFY_OTHER

Followed by the lines of instructions on what to modify and how. Followed by the following line:

END_MODIFY_OTHER

`.trim(),
];
