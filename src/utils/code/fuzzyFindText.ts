import { sleep } from '../sleep';
import { coreSimilarityFunction } from './coreSimilarityFunction';

const DEFAULT_SIMILARITY_THRESHOLD = 0.75;

export async function fuzzyFindText({
  currentCode,
  findText,
  similarityFunction = coreSimilarityFunction,
  lineNumTolerance = Math.ceil(findText.split('\n').length * 0.05),
  similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
}: {
  currentCode: string;
  findText: string;
  similarityFunction?: (original: string[], replacement: string[]) => number;
  lineNumTolerance?: number;
  similarityThreshold?: number;
}): Promise<{
  lineStartIndex: number;
  lineEndIndex: number;
  confidence: number;
}> {
  const currentCodeLines = currentCode.split('\n');
  const findTextLines = findText.split('\n');

  // Step 3: Iterate through the currentCodeLines with a nested loop to find the highest similarity between the lines in the currentCode and the findText.
  let maxSimilarity = -1;
  let maxSimilarityLineStartIndex = -1;
  let maxSimilarityLineEndIndex = -1;

  const minLinesToReplace = Math.max(
    0,
    findTextLines.length - lineNumTolerance,
  );

  for (
    let start = 0;
    start < currentCodeLines.length - minLinesToReplace;
    start++
  ) {
    let maxLinesToReplace = minLinesToReplace + 3; // This will get enlarged
    let lastSimilarity = 0;
    for (
      let end = start + minLinesToReplace;
      end <= Math.min(currentCodeLines.length, start + maxLinesToReplace);
      end++
    ) {
      const currentSlice = currentCodeLines.slice(start, end);
      const similarity = similarityFunction(currentSlice, findTextLines);

      if (similarity > lastSimilarity) {
        maxLinesToReplace += 1;
      }
      lastSimilarity = similarity;

      if (similarity > maxSimilarity && similarity >= similarityThreshold) {
        maxSimilarity = similarity;
        maxSimilarityLineStartIndex = start;
        maxSimilarityLineEndIndex = end;
      }
    }

    await sleep(1);
  }

  return {
    lineStartIndex: maxSimilarityLineStartIndex,
    lineEndIndex: maxSimilarityLineEndIndex,
    confidence: maxSimilarity,
  };
}
