import { getCommentForLanguage } from '../utils/code/comments';
import { fuzzyReplaceTextInner } from '../utils/code/fuzzyReplaceText';

type CommandSegment = {
  name: string;
  params?: string[];
  followedBy?: CommandSegment[];
  execute?: (currentContent: string, languageId: string, params: { [key: string]: string }) => Promise<string>;
};
const REPLACE_REGEX = /^(?:(?!```).)*```[^\n]*\n(.*?)\n```(?:(?!```).)*$/s;
const REPLACE_VALUE = '$1';
const COMMAND_STRUCTURE: CommandSegment[] = [
  {
    name: 'REPLACE',
    followedBy: [
      {
        name: 'WITH',
        followedBy: [
          {
            name: 'END_REPLACE',
            execute: async (currentContent, languageId, params) => {
              const findText = params.REPLACE.replace(REPLACE_REGEX, REPLACE_VALUE);
              const withText = params.WITH.replace(REPLACE_REGEX, REPLACE_VALUE);
              const replacementArray = await fuzzyReplaceTextInner({
                currentCode: currentContent,
                findText,
                withText,
              });
              if (replacementArray === undefined || replacementArray.length !== 3) {
                throw new Error(`Could not find:\n${findText}`);
              }

              return replacementArray.join('');
            },
          },
        ],
      },
    ],
  },

  {
    name: 'REPLACE_ALL',
    followedBy: [
      {
        name: 'END_REPLACE_ALL',
        execute: async (currentContent, languageId, params) => {
          return params.REPLACE_ALL.replace(REPLACE_REGEX, REPLACE_VALUE);
        },
      },
    ],
  },
  {
    name: 'INSERT',
    followedBy: [
      {
        name: 'BEFORE',
        followedBy: [
          {
            name: 'END_INSERT',
            execute: async (currentContent, languageId, params) => {
              const beforeText = params.BEFORE.replace(REPLACE_REGEX, REPLACE_VALUE);
              const insertText = params.INSERT.replace(REPLACE_REGEX, REPLACE_VALUE);
              const replacementArray = await fuzzyReplaceTextInner({
                currentCode: currentContent,
                findText: beforeText,
                withText: `${insertText}\n${beforeText}`,
              });
              if (replacementArray === undefined || replacementArray.length !== 3) {
                throw new Error(`Could not find:\n${beforeText}`);
              }

              return replacementArray.join('');
            },
          },
        ],
      },
    ],
  },

  {
    name: 'MODIFY_OTHER',
    followedBy: [
      {
        name: 'END_MODIFY_OTHER',
        execute: async (currentContent, languageId, params) => {
          return getCommentForLanguage(languageId, params.MODIFY_OTHER) + '\n' + currentContent;
        },
      },
    ],
  },
];

export async function applyModificationProcedure(originalCode: string, modificationProcedure: string, languageId: string) {
  let currentCode = originalCode;
  const lines = modificationProcedure.split('\n');
  let inCommand: CommandSegment | undefined;
  let params: { [key: string]: string } = {};

  async function newCommand(command: CommandSegment, basedOnLine: string) {
    inCommand = command;

    const lineWithoutCommand = basedOnLine.substring(inCommand.name.length).trim();
    const readParams = lineWithoutCommand.split(' ');
    for (const paramName of inCommand.params || []) {
      params[paramName] = readParams.shift() || '';
    }

    if (inCommand.execute) {
      currentCode = await inCommand.execute(currentCode, languageId, params);
    }

    if (!inCommand.followedBy || inCommand.followedBy.length === 0) {
      inCommand = undefined;
      params = {};
    } else {
      params[inCommand.name] = '';
    }
  }

  for await (const line of lines) {
    await new Promise((resolve) => setTimeout(resolve, 1));

    const possibilities: CommandSegment[] = inCommand ? inCommand.followedBy || [] : COMMAND_STRUCTURE;
    const possibleNextCommands = possibilities.filter((command) => line.startsWith(command.name));

    if (possibleNextCommands.length === 0) {
      if (inCommand) {
        const outOfOrderNewCommands = COMMAND_STRUCTURE.filter((command) => line.startsWith(command.name));

        if (outOfOrderNewCommands.length > 0) {
          const outOfOrderNewCommand = outOfOrderNewCommands.sort((a, b) => a.name.length - b.name.length)[0];
          const findEnd = inCommand.followedBy?.find((followedBy) => followedBy.name.startsWith('END_') && followedBy.execute);

          if (findEnd && findEnd.execute) {
            currentCode = await findEnd.execute(currentCode, languageId, params);
            inCommand = undefined;
            params = {};
          } else {
            throw new Error(`Missing any of: ${(inCommand.followedBy || []).map((c) => c.name).join(', ')}`);
          }

          await newCommand(outOfOrderNewCommand, line);
        } else {
          params[inCommand.name] += `${params[inCommand.name] ? '\n' : ''}${line}`;
        }
        continue;
      }
    }

    if (possibleNextCommands.length > 0) {
      await newCommand(possibleNextCommands.sort((a, b) => a.name.length - b.name.length)[0], line);
    }
  }

  if (inCommand) {
    throw new Error(`Missing any of: ${(inCommand.followedBy || []).map((c) => c.name).join(', ')}`);
  }

  if (originalCode === currentCode) {
    throw new Error('The code has not been changed');
  }

  return currentCode;
}
