import { ParsedLine } from '../types';

/**
 * This function processes the chunkBuffer string line by line, checking for lines starting with "data: " or JSON error objects. If a line starts with "data: ", it removes the prefix, trims whitespace, attempts JSON parsing, and adds the result to an array. If parsing fails, it logs an error and throws an exception. For lines not starting with "data: ", it assumes they are JSON error objects and handles them accordingly. The function repeats this process until there are no more newline characters in chunkBuffer, returning the array of ParsedLine objects and the modified chunkBuffer.
 * @param chunkBuffer The chunk buffer to extract parsed lines from.
 * @returns A tuple containing the array of parsed lines and the modified chunk buffer.
 * @throws An error if an error object is encountered in the chunk buffer.
 */
export function extractParsedLines(
  chunkBuffer: string,
): [ParsedLine[], string] {
  const parsedLines: ParsedLine[] = [];
  let chunkBufferCopy = chunkBuffer;
  while (chunkBufferCopy.includes('\n')) {
    if (chunkBufferCopy.startsWith('\n')) {
      chunkBufferCopy = chunkBufferCopy.slice(1);
      continue;
    }

    if (chunkBufferCopy.startsWith('data: ')) {
      const [line, ...rest] = chunkBufferCopy.split('\n');
      chunkBufferCopy = rest.join('\n');

      if (line === 'data: [DONE]') continue;

      const parsedLine = line.replace(/^data: /, '').trim();
      if (parsedLine !== '') {
        try {
          parsedLines.push(JSON.parse(parsedLine) as ParsedLine);
        } catch (e) {
          console.error(`Error parsing chunk: ${line}`);
          throw e;
        }
      }
    } else {
      const errorObject = JSON.parse(chunkBufferCopy) as { error?: Error };

      if (errorObject.error) {
        throw new Error(JSON.stringify(errorObject));
      } else {
        throw new Error(`Unexpected JSON object: ${chunkBufferCopy}`);
      }
    }
  }

  return [parsedLines, chunkBufferCopy];
}
