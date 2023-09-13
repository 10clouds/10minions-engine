export function convertToUnderscore(v: string) {
  return v
    .split(/(?=[A-Z][^A-Z_])/)
    .join('_')
    .split(/\s+(?=[^_])/)
    .join('_')
    .replace(/[^A-Za-z0-9_]/g, '')
    .toUpperCase();
}
