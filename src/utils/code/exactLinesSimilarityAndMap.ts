import { SingleLineSimilarityFunction } from './fuzzyReplaceText';

export function exactLinesSimilarityAndMap(
  original: string[],
  find: string[],
  lineSimilarityFunction: SingleLineSimilarityFunction,
  mapFindLine: (original: string | undefined, findLine: string) => string = (
    original,
    findLine,
  ) => findLine,
): { similarity: number; mappedFind: string[] } {
  const mappedFind: string[] = [];
  let originalLine = 0;
  let findLine = 0;

  let originalSimilarityLines = 0;

  function lineSkippedValue(line: string) {
    const baseSkippedValue = 0.02;
    const scalableSkippedValue = 0.98;
    const skipScaling = 1 - 1 / (1 + line.trim().length);

    return baseSkippedValue + scalableSkippedValue * skipScaling;
  }

  const options = [
    {
      condition: () => originalLine < original.length && findLine < find.length,
      similarity: () =>
        lineSimilarityFunction(original[originalLine], find[findLine]),
      skippedOriginalLines: () => 0,
      skippedFindLines: () => 0,
      apply: () => {
        mappedFind.push(mapFindLine(original[originalLine], find[findLine]));
        originalLine++;
        findLine++;
        originalSimilarityLines++;
      },
    },
    (() => {
      const skippedOriginalLines = 1;

      return {
        condition: () =>
          originalLine + skippedOriginalLines < original.length &&
          findLine < find.length,
        similarity: () =>
          lineSimilarityFunction(
            original[originalLine + skippedOriginalLines],
            find[findLine],
          ),
        skippedOriginalLines: () => skippedOriginalLines,
        skippedFindLines: () => 0,
        apply: () => {
          mappedFind.push(
            mapFindLine(
              original[originalLine + skippedOriginalLines],
              find[findLine],
            ),
          );

          originalLine++;
          findLine++;
          originalSimilarityLines++;

          originalLine += skippedOriginalLines;
        },
      };
    })(),
    (() => {
      const skippedFindLines = 1;

      return {
        condition: () =>
          originalLine < original.length &&
          findLine + skippedFindLines < find.length,
        similarity: () =>
          lineSimilarityFunction(
            original[originalLine],
            find[findLine + skippedFindLines],
          ),
        skippedOriginalLines: () => 0,
        skippedFindLines: () => skippedFindLines,
        apply: () => {
          for (let i = 0; i < skippedFindLines; i++) {
            mappedFind.push(mapFindLine(undefined, find[findLine + i]));
          }
          mappedFind.push(
            mapFindLine(
              original[originalLine],
              find[findLine + skippedFindLines],
            ),
          );

          originalLine++;
          findLine++;
          originalSimilarityLines++;

          findLine += skippedFindLines;
        },
      };
    })(),
    {
      condition: () =>
        originalLine < original.length && findLine >= find.length,
      similarity: () => 0,
      skippedOriginalLines: () => 1,
      skippedFindLines: () => 0,
      apply: () => {
        originalLine++;
      },
    },
    {
      condition: () =>
        originalLine >= original.length && findLine < find.length,
      similarity: () => 0,
      skippedOriginalLines: () => 0,
      skippedFindLines: () => 1,
      apply: () => {
        mappedFind.push(mapFindLine(undefined, find[findLine]));
        findLine++;
      },
    },
  ];

  let similaritySum = 0;
  let linesSkipped = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let bestOption;
    let bestSimilarity = Number.MIN_SAFE_INTEGER;

    for (const option of options) {
      if (option.condition()) {
        const similarity = option.similarity();

        if (isNaN(similarity)) {
          throw new Error('similarity is NaN');
        }

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestOption = option;
        }
      }
    }

    if (bestOption === undefined) {
      break;
    }

    for (
      let orgIndex = 0;
      orgIndex < bestOption.skippedOriginalLines();
      orgIndex++
    ) {
      linesSkipped += lineSkippedValue(original[originalLine + orgIndex]);
    }

    for (
      let findIndex = 0;
      findIndex < bestOption.skippedFindLines();
      findIndex++
    ) {
      linesSkipped += lineSkippedValue(find[findLine + findIndex]);
    }

    bestOption.apply();
    similaritySum += bestSimilarity;
  }

  if (original.length === 0 && find.length === 0) {
    return { similarity: 1, mappedFind };
  }

  if (original.length === 0 && find.length !== 0) {
    return { similarity: 0, mappedFind };
  }

  const averageSimilarity =
    originalSimilarityLines === 0 ? 1 : similaritySum / originalSimilarityLines;
  const noSkipRatio =
    (3 * (1 - linesSkipped / original.length) + 1 * (1 / (1 + linesSkipped))) /
    4;

  return { similarity: averageSimilarity * noSkipRatio, mappedFind };
}
