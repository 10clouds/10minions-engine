export type OutputType = {
  description: string;
  prompt: string;
  preprocessOutput: (output: string) => string;
  preprocessTransformedOutput: (transformed: string) => string;
};
