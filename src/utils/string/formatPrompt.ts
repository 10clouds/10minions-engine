/**
 * Removes leading and lagging whitespace from a prompt.
 * Removes common indentation from a prompt.
 */
export function formatPrompt(prompt: string) {
  const lines = prompt.split('\n');

  function removeLeadingEmptyLines(lines: string[]) {
    while (lines[0]?.trim() === '') {
      lines.shift();
    }
  }

  function removeTrailingEmptyLines(lines: string[]) {
    while (lines[lines.length - 1]?.trim() === '') {
      lines.pop();
    }
  }

  removeLeadingEmptyLines(lines);
  removeTrailingEmptyLines(lines);

  // Identify non-empty lines
  const nonEmptyLines = lines.filter((line) => !(line.trim() === ''));

  // If there are no non-empty lines, return empty string
  if (nonEmptyLines.length === 0) {
    return '';
  }

  // Find minimum indentation across all lines.
  // Non-empty lines are navigated and the count of leading whitespaces is determined for each line.
  // The least value is held as the minimum indentation.
  let minIndentation = Infinity;
  nonEmptyLines.forEach((line) => {
    const leadingSpaces = line.match(/^\s*/)?.[0].length ?? 0;

    // Ignore lines that are not indented
    if (leadingSpaces < minIndentation && leadingSpaces > 0) {
      minIndentation = leadingSpaces;
    }
  });

  // Remove the same amount of indentation from all lines
  const formattedLines = lines.map((line) => line.slice(minIndentation));

  return formattedLines.join('\n');
}
