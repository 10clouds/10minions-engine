import { z } from 'zod';
import { countTokens } from '../src/gpt/countTokens';
import { gptExecute } from '../src/gpt/gptExecute';
import { GPTMode } from '../src/gpt/types';
import { MinionTask } from '../src/minionTasks/MinionTask';
import { extractExtensionNameFromPath } from '../src/utils/extractFileNameFromPath';
import { TestSchemas } from './types';

enum Languages {
  'js' = 'javascript',
  'ts' = 'typescript',
  'py' = 'python',
}

const prompt = async (minionTask: MinionTask) => {
  const document = await minionTask.document();
  const documentExtension = extractExtensionNameFromPath(document.uri.fsPath) as keyof typeof Languages;

  return `
  You are an expert senior software developer, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200, you are also an expert in writing TDD (Test-Driven Development) or BDD (Behaviour-Driven Development) tests.
  
  Your task is to write possible test cases that should be applied to ORIGINAL CODE based on USER QUERY and as a response return ONLY INSTRUCTION for AI that will validate it later.
  INSTRUCTIONS should have MAXIMUM 2 sentences and be accurate as it possible.

  ===== IMPORTANT INFORMATION =====
  * First INSTRUCTION always should be: "The code is valid ${Languages[documentExtension]} code"
  * INSTRUCTIONS have to be non deterministic
  * assertion field should only contain INSTRUCTION
  * Try to find out possible problem based on USER QUERY
  * DO NOT REPEAT similar instructions make all INSTRUCTION cover one problem
  * if there is no reason to generate MAXIMUM NUMBER OF RESULTS do not do it. Number of test cases can be less than MAXIMUM NUMBER OF RESULTS
  
  You have 2 mode that you can use: "QUALITY" which is gpt-4-0613 or "FAST" which is gpt-3.5-turbo-16k-0613. These modes define which GPT engine should be used to execute particular instuction. You have to decide which one should be used in particular case based on your experience and huge knowledge about that.

  There are 3 type of tests: gptAssert, stringToFind and functionReturnTypeCheck in most cases you will be using gptAssert type.

  IF type is functionReturnTypeCheck structure of test should be like:

    type: "functionReturnTypeCheck",
    functionName: string,
    expectedType: string,

  IF type is simpleStringFind structure of test should be like:

    type: "simpleStringFind",
    stringToFind: string,


  IF type is gptAssert structure of test should be like:
  
    type: "gptAssert",
    mode: "QUALITY" or "FAST",
    assertion: string

  ===== MAXIMUM NUMBER OF RESULTS =====
  8

  Below are content of files that you should based on to define INSTRUCTIONS.

  Original code contains user's original file content
  ===== ORIGINAL CODE =====
  ${minionTask.originalContent}

  User query is a prompt for GPT and defines what should happend to code.
  ===== USER QUERY =====
  ${minionTask.userQuery}

  Selected text contains a part of text selected by user in original file - this is optional and sometimes can be empty
  ===== SELECTED TEXT =====
  ${minionTask.selectedText}

  Based on provided above informations generate 8 test cases, but the most accurate and crucial one. Remember that you HAVE TO write INSTRUCTIONS that will check if code fullfill user request.

  At the end of the generating test cases process take those 8 tests and improve them to be general for the case, but they must meet the starting and basic assumptions.
  `;
};

export const generateScoreTests = async (minionTask?: MinionTask) => {
  if (!minionTask) return;
  const fullPrompt = await prompt(minionTask);
  const inputTokensCount = countTokens(fullPrompt, GPTMode.QUALITY);
  const outputTokensCount = 350;
  const maxTokens = inputTokensCount + outputTokensCount;

  console.log('GENERATING TEST CASES...');

  const response = await gptExecute({
    fullPrompt,
    onChunk: async (chunk: string) => {},
    maxTokens,
    mode: GPTMode.QUALITY,
    temperature: 1,
    controller: new AbortController(),
    outputName: 'classification',
    outputSchema: z
      .object({
        items: z.array(TestSchemas),
      })
      .describe('Classification'),
  });

  console.log('======= RESPONSE =======');
  console.log(response.result);

  return JSON.stringify(response.result);
};
