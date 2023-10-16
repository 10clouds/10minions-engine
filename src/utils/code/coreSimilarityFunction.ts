import {
  codeStringSimilarity,
  levenshteinDistanceSimilarity,
} from '../string/stringUtils';
import { exactLinesSimilarityAndMap } from './exactLinesSimilarityAndMap';
import { ignoreLeadingAndTrailingWhiteSpaceSimilarityFunction } from './ignoreLeadingAndTrailingWhiteSpaceSimilarityFunction';
import { normalizeIndent } from './normalizeIndent';
import { stripAllComments } from './stripAllComments';

export const coreSimilarityFunction = (
  original: string[],
  replacement: string[],
) => {
  if (original.join('\n') === replacement.join('\n')) {
    return 1;
  }

  const similarityWithWsDistance = exactLinesSimilarityAndMap(
    original,
    replacement,
    (a, b) =>
      ignoreLeadingAndTrailingWhiteSpaceSimilarityFunction(
        a,
        b,
        codeStringSimilarity,
      ),
  ).similarity;

  const similarityNotIgnoringWhitespace = exactLinesSimilarityAndMap(
    normalizeIndent(stripAllComments(original)),
    normalizeIndent(stripAllComments(replacement)),
    levenshteinDistanceSimilarity,
  ).similarity;

  const core = Math.max(
    similarityWithWsDistance,
    similarityNotIgnoringWhitespace,
  );

  const similarity =
    0.6 * core +
    0.2 * similarityWithWsDistance +
    0.2 * similarityNotIgnoringWhitespace;

  if (isNaN(similarity)) {
    throw new Error('similarity is NaN');
  }

  return similarity;
};
