export type Criterion<S> = {
  name: string;
  maxPointsIf: string;
  maxPoints: number;
  calculate: 'GPT' | ((solution: S) => number);
  suggestions: 'GPT' | ((solution: S) => string[]);
};
