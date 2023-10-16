import { coreSimilarityFunction } from './coreSimilarityFunction';
import { fuzzyReplaceTextInner } from './fuzzyReplaceTextInner';

export type SingleLineSimilarityFunction = (
  original: string,
  replacement: string,
) => number;
export type MultiLineSimilarityFunction = (
  original: string[],
  replacement: string[],
) => number;

const DEFAULT_SIMILARITY_THRESHOLD = 0.75;

export async function fuzzyReplaceText({
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
  return (
    await fuzzyReplaceTextInner({
      currentCode,
      findText,
      withText,
      similarityFunction,
      similarityThreshold,
    })
  )?.join('');
}
