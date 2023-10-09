export function commonStringEnd(
  commonIndent: string,
  lineIndent: string,
): string {
  let commonEnd = '';
  for (let i = 0; i < Math.min(commonIndent.length, lineIndent.length); i++) {
    if (
      commonIndent[commonIndent.length - i - 1] ===
      lineIndent[lineIndent.length - i - 1]
    ) {
      commonEnd = commonIndent[commonIndent.length - i - 1] + commonEnd;
    } else {
      break;
    }
  }

  return commonEnd;
}

export function commonStringStart(commonIndent: string, lineIndent: string) {
  let commonStart = '';
  for (let i = 0; i < Math.min(commonIndent.length, lineIndent.length); i++) {
    if (commonIndent[i] === lineIndent[i]) {
      commonStart += commonIndent[i];
    } else {
      break;
    }
  }

  return commonStart;
}

/**
 * assumes that indents is not empty
 */
export function commonStringEndArray(indents: string[]) {
  let commonIndent = undefined;
  for (const lineIndent of indents) {
    if (commonIndent === undefined) {
      commonIndent = lineIndent;
    } else {
      commonIndent = commonStringEnd(commonIndent, lineIndent);
    }
  }

  return commonIndent;
}

export function removeIndent(slice: string[], indent?: string) {
  let indentCopy = indent;
  if (indentCopy === undefined) {
    const indents = slice.map((line) => line.match(/(^\s*)/)?.[1] || '');
    indentCopy = commonStringEndArray(indents);
  }

  if (indentCopy === undefined) {
    return slice;
  }

  return slice.map((line) => line.slice(indentCopy?.length));
}

export function applyIndent(slice: string[], indent: string[] | string) {
  return slice.map((line, i) => {
    if (Array.isArray(indent)) {
      return line.trim().length > 0 ? indent[i] + line : line;
    }

    return line.trim().length > 0 ? indent + line : line;
  });
}

/**
 * minimum number of single-character edits to change one to another
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          ),
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function levenshteinDistanceSimilarity(a: string, b: string): number {
  const len = Math.max(a.length, b.length);
  if (len === 0) {
    return 1;
  }

  return 1 - levenshteinDistance(a, b) / len;
}

export function equalsStringSimilarity(a: string, b: string): number {
  let matchingChars = 0;

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) {
      matchingChars++;
    } else {
      break;
    }
  }

  const max = Math.max(a.length, b.length);

  if (max === 0) {
    return 1;
  }

  return matchingChars / max;
}

export function normalizeWhiteSpace(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

export function codeStringSimilarity(a: string, b: string): number {
  const preprocessedA = normalizeWhiteSpace(a);
  const preprocessedB = normalizeWhiteSpace(b);
  const maxLength = Math.max(preprocessedA.length, preprocessedB.length);

  if (maxLength === 0) {
    return 1;
  }

  const changes = levenshteinDistance(preprocessedA, preprocessedB);

  const similarityScore = 1 - changes / maxLength;

  return similarityScore;
}
