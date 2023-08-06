import path from 'path';
import fs from 'fs';
import { MinionTask } from '../src/minionTasks/MinionTask';
import { getEditorManager } from '../src/managers/EditorManager';

export const initMinionTask = async (userQuery: string, fileName: string, originalCodeFile: string) => {
  const checkPath = path.join(__dirname, 'score', `${fileName}/selectedText.txt`); // Path to the selectedText file
  const selectedTextExists = fs.existsSync(checkPath); // Check if selectedText file exists
  const readSelectedText = selectedTextExists ? fs.readFileSync(checkPath, 'utf8') : ''; // Read the selectedText file if it exists, else "".

  let start = { line: 0, character: 0 };
  let end = { line: 0, character: 0 };

  if (readSelectedText !== '') {
    const startIndex = userQuery.indexOf(readSelectedText);
    const endIndex = startIndex + readSelectedText.length;

    // For simplicity, we're considering flat characters indices in file
    // A more advanced implementation would consider \n character to split lines
    start = { line: startIndex, character: 0 };
    end = { line: endIndex, character: 0 };
  }
  const execution = await MinionTask.create({
    userQuery,
    document: await getEditorManager().openTextDocument(getEditorManager().createUri(path.join(__dirname, 'score', `${fileName}/${originalCodeFile}`))),
    // Use dynamically calculated 'start' and 'end'
    selection: { start, end },
    selectedText: readSelectedText,
    minionIndex: 0,
    onChanged: async () => {},
  });

  return {
    execution,
  };
};
