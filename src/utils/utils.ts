export const sum = <T>(array: T[], query?: (obj: T) => number): number =>
  query ? array.reduce((a, b) => a + query(b), 0) : (array as number[]).reduce((a, b) => a + b, 0);

export const withDefault = <T>(value: T | null | undefined, defaultValue: T) => (value === null ? defaultValue : value);
