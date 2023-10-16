import {
  applyIndent,
  equalsStringSimilarity,
  levenshteinDistanceSimilarity,
} from '../string/stringUtils';
import { coreSimilarityFunction } from './coreSimilarityFunction';
import { exactLinesSimilarityAndMap } from './exactLinesSimilarityAndMap';
import { findIndentationDifference } from './findIndentationDifference';
import { fuzzyFindText } from './fuzzyFindText';
import { getIndentationDifference } from './fuzzyGetIndentationDifference';
import { MultiLineSimilarityFunction } from './fuzzyReplaceText';

const DEFAULT_SIMILARITY_THRESHOLD = 0.75;

export async function fuzzyReplaceTextInner({
  currentCode,
  findText,
  withText,
  similarityFunction = coreSimilarityFunction,
  similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
}: {
  currentCode: string;
  findText: string;
  withText: string;
  similarityFunction?: MultiLineSimilarityFunction;
  similarityThreshold?: number;
  lineNumTolerance?: number;
}) {
  const {
    lineStartIndex: startIndex,
    lineEndIndex: endIndex,
    confidence,
  } = await fuzzyFindText({
    currentCode,
    findText,
    similarityFunction,
    similarityThreshold,
  });

  if (confidence >= similarityThreshold) {
    const currentCodeLines = currentCode.split('\n');

    const currentSlice = currentCodeLines.slice(startIndex, endIndex);
    const findTextLines = findText.split('\n');
    const withTextLines = withText.split('\n');

    function mapFindWithIndent(
      originalLine: string | undefined,
      searchLine: string,
    ) {
      if (originalLine === undefined) {
        return lastIndent + searchLine;
      }
      const indentDiff = getIndentationDifference(originalLine, searchLine);
      lastIndent = indentDiff;

      return indentDiff + searchLine;
    }

    let lastIndent = '';

    const indentAdjustedFindLines = exactLinesSimilarityAndMap(
      currentSlice,
      findTextLines,
      (a, b) => levenshteinDistanceSimilarity(a, b),
      mapFindWithIndent,
    ).mappedFind;

    lastIndent = '';

    //split the withTextLines into a segment containing the segment up to first non empty first line and a segment containing the rest
    const withTextUpToFirstNonEmptyLine = withTextLines.slice(0, 1);
    const withTextRest = withTextLines.slice(1);

    const indentAdjustedFindLinesUpToFirstNonEmptyLine =
      indentAdjustedFindLines.slice(0, 1);
    const indentAdjustedFindLinesRest = indentAdjustedFindLines.slice(1);

    const indentAdjustedWithTextualToFirstNonEmptyLine =
      exactLinesSimilarityAndMap(
        indentAdjustedFindLinesUpToFirstNonEmptyLine,
        withTextUpToFirstNonEmptyLine,
        (a, b) => levenshteinDistanceSimilarity(a, b),
        mapFindWithIndent,
      ).mappedFind;

    const overallIndentDifference =
      findIndentationDifference(
        currentSlice,
        withTextLines,
        equalsStringSimilarity,
      ) || '';
    const indentAdjustedWithTextRest = applyIndent(
      withTextRest,
      overallIndentDifference,
    );
    const indentAdjustedWithLines = [
      ...indentAdjustedWithTextualToFirstNonEmptyLine,
      ...indentAdjustedWithTextRest,
    ];

    const adjustedWithText = indentAdjustedWithLines.join('\n');

    const preChange = currentCodeLines.slice(0, startIndex).join('\n');
    const postChange = currentCodeLines.slice(endIndex).join('\n');

    return [
      preChange + (preChange ? '\n' : ''),
      adjustedWithText,
      (postChange ? '\n' : '') + postChange,
    ];
  }
}
