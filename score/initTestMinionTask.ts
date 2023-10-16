import { readFile } from 'node:fs/promises';

import { existsSync } from 'fs';
import path from 'path';

import {
  EditorPosition,
  getEditorManager,
} from '../src/managers/EditorManager';
import { MinionTask } from '../src/minionTasks/MinionTask';

export interface Selection {
  start: EditorPosition;
  end: EditorPosition;
  selectedText: string;
}

export const initMinionTask = async (
  userQuery: string,
  filePath: string,
  selectionData?: Selection,
  fileName?: string,
) => {
  let readSelectedText = '';
  if (fileName) {
    const checkPath = path.join(
      __dirname,
      'score',
      `${fileName}/selectedText.txt`,
    ); // Path to the selectedText file
    const selectedTextExists = existsSync(checkPath); // Check if selectedText file exists
    readSelectedText = selectedTextExists
      ? await readFile(checkPath, 'utf-8')
      : ''; // Read the selectedText file if it exists, else "".
  }

  let start = { line: 0, character: 0 };
  let end = { line: 0, character: 0 };

  if (selectionData && selectionData.selectedText !== '') {
    start = selectionData.start;
    end = selectionData.end;
  } else if (readSelectedText !== '') {
    const startIndex = userQuery.indexOf(readSelectedText);
    const endIndex = startIndex + readSelectedText.length;

    // For simplicity, we're considering flat characters indices in file
    // A more advanced implementation would consider \n character to split lines
    start = { line: startIndex, character: 0 };
    end = { line: endIndex, character: 0 };
  }
  const execution = await MinionTask.create({
    userQuery,
    document: await getEditorManager().openTextDocument(
      getEditorManager().createUri(filePath),
    ),
    // Use dynamically calculated 'start' and 'end'
    selection: { start, end },
    selectedText: selectionData ? selectionData.selectedText : readSelectedText,
    minionIndex: 0,
    onChanged: async () => {},
  });

  return {
    execution,
  };
};
