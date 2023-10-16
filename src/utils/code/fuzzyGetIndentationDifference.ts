import { checkStartWhiteSpace } from './regexUtils';

export function getIndentationDifference(
  currentLine: string,
  replaceTextLine: string,
) {
  const currentIndent = checkStartWhiteSpace(currentLine);
  const replaceTextIndent = checkStartWhiteSpace(replaceTextLine);
  const indentDifference = currentIndent.slice(
    0,
    currentIndent.length - replaceTextIndent.length,
  );

  return indentDifference;
}

export function fuzzyGetIndentationDifference(
  currentLine: string,
  replaceTextLine: string,
  similarityFunction: (a: string, b: string) => number,
) {
  return {
    confidence: similarityFunction(currentLine.trim(), replaceTextLine.trim()),
    indent: getIndentationDifference(currentLine, replaceTextLine),
  };
}
