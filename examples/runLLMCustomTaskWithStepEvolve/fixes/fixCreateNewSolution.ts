import { z } from 'zod';
import { gptExecute } from '../../../src/gpt/gptExecute';
import { GPTMode } from '../../../src/gpt/types';
import { TaskDefinition } from '../TaskDefinition';

export function createNewSolutionFix(problem: TaskDefinition) {
  return {
    name: 'Create new solution',
    call: async () => {
      return (
        await gptExecute({
          fullPrompt: problem.task,
          maxTokens: 500,
          mode: GPTMode.FAST,
          outputSchema: z.string(),
        })
      ).result;
    },
  };
}
