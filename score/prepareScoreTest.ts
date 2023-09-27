import { initMinionTask } from '../score/initTestMinionTask';
import { generateScoreTests } from './generateScoreTests';
import { initCLISystems, setupCLISystemsForTest } from '../src/CLI/setupCLISystems';
import { countTokens } from '../src/gpt/countTokens';
import { gptExecute } from '../src/gpt/gptExecute';
import { GPTMode } from '../src/gpt/types';
import { z } from 'zod';
import { ScoreTest } from './types';
import { TestRequiredData } from './prepareTestFiles';
import path from 'path';

const ITERATIONS = 6;

export const prepareScoreTest = async (userQuery: string, fileName: string, minionTask: TestRequiredData) => {
  initCLISystems();
  setupCLISystemsForTest();
  try {
    let allTestCases: ScoreTest[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const minionTaskFilePath = path.join(__dirname, 'score', `${fileName}/original.txt`);
      const { execution } = await initMinionTask(userQuery, minionTaskFilePath, undefined, fileName);
      const tests = await generateScoreTests(execution, true);
      if (tests?.result) {
        allTestCases = [...allTestCases, ...JSON.parse(tests?.result).items];
      }
    }

    const prompt = `
  You are provided with ARRAY OF TESTS.
  Your task is to review from provided TEST CASES and pick only 7 TEST CASES that in your opinion are the most valuable and accurate, without changing their content and structure. Tests has to be unique and can not repeat.
  DO NOT CHANGE CONTENT OF PROVIDED TEST CASES
  DO NOT ADD ADDITIONAL INFORMATION JUST GIVE ME ARRAY OF TESTS AS AN OUTPUT
  [ARRAY OF TESTS]
  ${JSON.stringify(allTestCases)}
  [ORIGINAL CODE]
  ${minionTask.originalContent}
  User query is a prompt for GPT and defines what should happend to code.
  [USER QUERY]
  ${minionTask.userQuery}
  Selected text contains a part of text selected by user in original file - this is optional and sometimes can be empty
  [SELECTED TEXT]
  ${minionTask.selectedText}
  `;
    const mode = GPTMode.FAST;
    const inputTokensCount = countTokens(prompt, mode);
    const outputTokensCount = 350;
    const maxTokens = inputTokensCount + outputTokensCount;
    const response = await gptExecute({
      fullPrompt: prompt,
      onChunk: async (chunk: string) => {},
      maxTokens,
      mode,
      temperature: 0,
      controller: new AbortController(),
      outputSchema: z.string(),
    });
    const result = response.result;
    console.log('====== FINAL TESTS ======');
    console.log(JSON.parse(result));

    return result;
  } catch (error) {
    console.error(error);
  }
};
