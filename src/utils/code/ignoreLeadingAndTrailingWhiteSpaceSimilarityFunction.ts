import { equalsStringSimilarity } from '../string/stringUtils';
import { checkEndWhiteSpace, checkStartWhiteSpace } from './regexUtils';

export function ignoreLeadingAndTrailingWhiteSpaceSimilarityFunction(
  currentLine: string,
  replaceTextLine: string,
  contentSimilarityFunction: (a: string, b: string) => number,
) {
  const currentPrefix = checkStartWhiteSpace(currentLine);
  const replaceTextPrefix = checkStartWhiteSpace(replaceTextLine);

  const currentPostfix = checkEndWhiteSpace(currentLine);
  const replaceTextPostfix = checkEndWhiteSpace(replaceTextLine);

  const CONTENT_WEIGHT = 0.9;
  const PREFIX_WEIGHT = 0.05;
  const POSTFIX_WEIGHT = 0.05;

  return (
    contentSimilarityFunction(currentLine.trim(), replaceTextLine.trim()) *
      CONTENT_WEIGHT +
    equalsStringSimilarity(currentPrefix, replaceTextPrefix) * PREFIX_WEIGHT +
    equalsStringSimilarity(currentPostfix, replaceTextPostfix) * POSTFIX_WEIGHT
  );
}
