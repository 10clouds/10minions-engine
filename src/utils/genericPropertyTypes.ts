export type StringProperties<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export function setStringValue<TC, K extends StringProperties<TC>>(obj: TC, key: K, value: string): void {
  obj[key] = value as TC[K];
}
