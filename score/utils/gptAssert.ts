import { z } from 'zod';

import { countTokens } from '../../src/gpt/countTokens';
import { gptExecute } from '../../src/gpt/gptExecute';
import { GPTMode } from '../../src/gpt/types';

// TODO: left as reference for now, but should be removed propably
export async function gptAssert({
  originalCode,
  resultingCode,
  mode = GPTMode.FAST,
  assertion,
}: {
  originalCode: string;
  resultingCode: string;
  mode?: GPTMode;
  assertion: string;
}) {
  const fullPrompt = `Resulting code:\n${resultingCode}\n\nPlease analyse the resulting code and answer: does the resulting code passes this test: "${assertion}"\n\n`;
  const maxTokens = countTokens(fullPrompt, GPTMode.FAST);

  const response = await gptExecute({
    fullPrompt,
    maxTokens,
    mode,
    outputName: 'reportTestResult',
    outputSchema: z
      .object({
        comment: z
          .string()
          .describe(
            'Describe the reason for why the code passed (or did not pass) the test.',
          ),
        passessTest: z
          .boolean()
          .describe('Whether the code passed the test or not.'),
      })
      .describe(
        `Report a result of the test, whenever the resulting code meets the criteria: ${assertion}, provide a comment explaining why it does not meet the criteria`,
      ),
  });

  return {
    passessTest: response.result.passessTest,
    comment: response.result.comment,
  };
}
