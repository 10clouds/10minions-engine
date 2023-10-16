export const checkStartWhiteSpace = (text: string) =>
  text.match(/^\s*/)?.[0] || '';
export const checkEndWhiteSpace = (text: string) =>
  text.match(/(\s*$)/)?.[1] || '';
export const checkIndentation = (text: string) =>
  text.match(/^\s*/)?.[0].length || 0;
