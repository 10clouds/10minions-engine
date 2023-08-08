import z from 'zod';
import { GPTMode } from '../src/gpt/types';

export const GPT_ASSERT = 'gptAssert';
export const SIMPLE_STRING_FIND = 'simpleStringFind';
export const FUNCTION_RETURN_TYPE_CHECK = 'functionReturnTypeCheck';

export type GPT_ASSERT_TYPE = typeof GPT_ASSERT;
export type SIMPLE_STRING_FIND_TYPE = typeof SIMPLE_STRING_FIND;
export type FUNCTION_RETURN_TYPE_CHECK_TYPE = typeof FUNCTION_RETURN_TYPE_CHECK;

type TestDefinitionType = typeof GPT_ASSERT | typeof SIMPLE_STRING_FIND | typeof FUNCTION_RETURN_TYPE_CHECK;

export const listOfTypes = [GPT_ASSERT, SIMPLE_STRING_FIND, FUNCTION_RETURN_TYPE_CHECK];

export type TestDefinition =
  | { type: GPT_ASSERT_TYPE; mode: GPTMode; assertion: string }
  | { type: SIMPLE_STRING_FIND_TYPE; stringToFind: string }
  | {
      type: FUNCTION_RETURN_TYPE_CHECK_TYPE;
      functionName: string;
      expectedType: string;
    };

interface BaseSchema {
  properties: {
    type: { type: 'string'; pattern: TestDefinitionType };
    mode?: { type: 'string' };
    assertion?: { type: 'string' };
    stringToFind?: { type: 'string' };
    functionName?: { type: 'string' };
    expectedType?: { type: 'string' };
  };
  required: ('type' | 'mode' | 'assertion' | 'stringToFind' | 'functionName' | 'expectedType')[];
}

export const gptAssertSchema = {
  properties: {
    type: { type: 'string', pattern: 'gptAssert' },
    mode: { type: 'string' },
    assertion: { type: 'string' },
  },
  required: ['type', 'mode', 'assertion'],
};

export const simpleStringFindSchema = {
  properties: {
    type: { type: 'string', pattern: 'simpleStringFind' },
    stringToFind: { type: 'string' },
  },
  required: ['type', 'stringToFind'],
};

export const functionReturnTypeCheckSchema = {
  properties: {
    type: { type: 'string', pattern: 'functionReturnTypeCheck' },
    functionName: { type: 'string' },
    expectedType: { type: 'string' },
  },
  required: ['type', 'functionName', 'expectedType'],
};

export const GptAssertSchema = z.object({
  type: z.literal('gptAssert'),
  mode: z.string(),
  assertion: z.string(),
});

export const SimpleStringFindSchema = z.object({
  type: z.literal('simpleStringFind'),
  stringToFind: z.string(),
});

export const FunctionReturnTypeCheckSchema = z.object({
  type: z.literal('functionReturnTypeCheck'),
  functionName: z.string(),
  expectedType: z.string(),
});

export const TestSchemas = z.union([GptAssertSchema, SimpleStringFindSchema, FunctionReturnTypeCheckSchema]);

export interface ScoreTest {
  type: 'functionReturnTypeCheck' | 'simpleStringFind' | 'gptAssert';
  mode?: string;
  functionName?: string;
  expectedType?: string;
  stringToFind?: string;
  assertion?: string;
}
