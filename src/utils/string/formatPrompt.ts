/**
 * Removes leading and lagging whitespace from a prompt.
 * Removes common indentation from a prompt.
 */
export function formatPrompt(prompt: string) {
  const lines = prompt.trim().split('\n');
  const minIndentation = lines.reduce((minIndentation, line) => {
    const indentation = line.match(/^\s*/)?.[0].length ?? 0;
    return Math.min(minIndentation, indentation);
  }, Infinity);
  const formattedLines = lines.map((line) => line.slice(minIndentation));
  return formattedLines.join('\n');
}
