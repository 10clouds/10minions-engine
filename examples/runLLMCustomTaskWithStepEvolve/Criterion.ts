export type Criterion<S> = {
  name: string;
  maxPointsIf: string;
  maxPoints: number;
  maintain: string;
  calculate: 'GPT' | ((solution: S) => number);
  suggestions: 'GPT' | ((solution: S) => string[]);
};

export type MultiCriterion<S> = {
  criteria: {
    name: string;
    maxPointsIf: string;
    maxPoints: number;
  }[];
  calculate: (solution: S) => number;
  suggestions: (solution: S) => string[];
}