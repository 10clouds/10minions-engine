import fs from 'fs';
import path from 'path';

import {
  EditorDocument,
  EditorPosition,
  EditorRange,
  EditorUri,
} from '../managers/EditorManager';

export class CLIEditorDocument implements EditorDocument {
  readonly languageId: string;
  readonly lineCount: number;
  readonly uri: EditorUri;
  private textLines: string[] = []; // This will store our text lines.

  constructor(uri: EditorUri) {
    this.uri = uri;

    const fileName = uri.fsPath;

    // Reading file contents synchronously for simplicity. Consider using async I/O in production code
    const fileContent = fs.readFileSync(fileName, 'utf8');
    this.textLines = fileContent.split('\n');
    this.lineCount = this.textLines.length;

    // Derive languageId from file extension. This is simplistic and might not always be correct.
    this.languageId = path.extname(fileName).slice(1);
  }

  getText(range?: EditorRange): string {
    // Return joined text from textLines array within given range or whole text if range is not provided
    return (
      range
        ? this.textLines.slice(range.start.line, range.end.line)
        : this.textLines
    ).join('\n');
  }
  lineAt(line: number): {
    readonly text: string;
    readonly lineNumber: number;
  } {
    if (line < 0 || line >= this.lineCount) {
      throw new Error(`Illegal value for line ${line}`);
    }

    // Return object with text and line number from the given line
    return {
      text: this.textLines[line],
      lineNumber: line + 1,
    };
  }

  insert(start: EditorPosition, text: string) {
    // First, get the existing text for the line
    const existingText = this.lineAt(start.line).text;

    // Insert the new text at the character position
    const newText =
      existingText.slice(0, start.character) +
      text +
      existingText.slice(start.character);

    // Update the line with the new text
    this.textLines[start.line] = newText;
  }

  replace(range: EditorRange, text: string) {
    // Here we need to replace the text from start to end within the range
    const startLineNumber = range.start.line;
    const endLineNumber = range.end.line;

    // Get the existing texts for start and end lines
    const startLineText = this.lineAt(startLineNumber).text;
    const endLineText = this.lineAt(endLineNumber).text;

    // Replace the text within the range
    const newTextStart = startLineText.slice(0, range.start.character) + text;
    const newTextEnd = endLineText.slice(range.end.character);

    // If start and end line numbers are same, then it's a replacement within same line
    if (startLineNumber === endLineNumber) {
      this.textLines[startLineNumber] = newTextStart + newTextEnd;
    } else {
      // Update start, end lines and remove lines between them
      this.textLines[startLineNumber] = newTextStart;
      this.textLines[endLineNumber] = newTextEnd;
      this.textLines.splice(
        startLineNumber + 1,
        endLineNumber - startLineNumber,
      );
    }
  }

  save() {
    // Write the text back to the file synchronously for simplicity. Consider using async I/O in production code
    fs.writeFileSync(this.uri.fsPath, this.textLines.join('\n'), 'utf8');
  }
}
