import { fuzzyGetIndentationDifference } from './fuzzyGetIndentationDifference';
import { checkIndentation } from './regexUtils';

/**
 * Try to guess indentation from the current slice and replaceTextLines
 */
export function findIndentationDifference(
  currentSlice: string[],
  replaceTextLines: string[],
  similarityFunction: (a: string, b: string) => number,
) {
  const indentationDifferences: number[] = [];

  for (
    let i = 0;
    i < Math.min(currentSlice.length, replaceTextLines.length);
    i++
  ) {
    const replaceLine = replaceTextLines[i];
    const replaceIndentation = checkIndentation(replaceLine);
    const currentLine = currentSlice[i];

    const currentIndentation = checkIndentation(currentLine);
    fuzzyGetIndentationDifference(currentLine, replaceLine, similarityFunction);
    indentationDifferences.push(currentIndentation - replaceIndentation);
  }

  const resultLines: string[] = [];

  for (let i = 0; i < replaceTextLines.length; i++) {
    const indentation = ' '.repeat(Math.abs(indentationDifferences[0]));
    resultLines.push(indentation);
  }
  resultLines.sort((a, b) => b.length - a.length);

  return resultLines;
}
