import { z } from 'zod';
import { createFullPromptFromSections } from '../src/gpt/createFullPromptFromSections';
import { gptExecute } from '../src/gpt/gptExecute';
import { GPTMode } from '../src/gpt/types';
import { MinionTask } from '../src/minionTasks/MinionTask';
import { shuffleArray } from '../src/utils/random/shuffleArray';
import { sum } from '../src/utils/utils';
import {
  FUNCTION_RETURN_TYPE_CHECK,
  FunctionReturnTypeCheckTestType,
  GPTAssertTestType,
  GPT_ASSERT,
  SIMPLE_STRING_FIND,
  ScoreTestType,
  SimpleStringToFindTestType,
} from './types';
import { checkFunctionReturnType } from './utils/checkFunctionReturnType';
import { countTokens } from '../src/gpt/countTokens';

interface MinionTaskCriteriaRatingResult {
  finalRating: number;
  criteriaRatings: CriteriaRatings[];
  passes: boolean;
}

export interface CriteriaRatings {
  rating: number;
  criteria: string;
  reasoning: string;
}

interface MinionTaskCriteria {
  [GPT_ASSERT]: GPTAssertTestType[];
  [FUNCTION_RETURN_TYPE_CHECK]: FunctionReturnTypeCheckTestType[];
  [SIMPLE_STRING_FIND]: SimpleStringToFindTestType[];
}

export const MAX_POINTS = 20;
const PERCENT_TO_PASS = 0.7;

export async function rateMinionTask(task: MinionTask, solution: string, criteriaDefinition: ScoreTestType[]): Promise<MinionTaskCriteriaRatingResult> {
  console.log('Rating minion task...');
  const TEST_PASS_RATING = criteriaDefinition.length * MAX_POINTS * PERCENT_TO_PASS;
  const { modificationDescription, userQuery } = task;
  const criteria: MinionTaskCriteria = {
    [GPT_ASSERT]: [],
    [FUNCTION_RETURN_TYPE_CHECK]: [],
    [SIMPLE_STRING_FIND]: [],
  };

  const { gptAssert, functionReturnTypeCheck, simpleStringFind } = criteria;

  criteriaDefinition.forEach((testCase: ScoreTestType) => {
    const { type } = testCase;
    (criteria[type] as ScoreTestType[]).push(testCase);
  });
  const criteriaArray = shuffleArray(gptAssert.slice())
    .map(({ assertion }) => `Max of ${MAX_POINTS}pts if the SOLUTION passes this test: '${assertion}'`)
    .join('\n');

  const fullPrompt = createFullPromptFromSections({
    intro: `Rate (from 0 to ${MAX_POINTS}) how good is the following SOLUTION that fullfill USER_QUERY request based on MODIFICATION_DESCRIPTION. The SOLUTION should fullfill the CRITERIA`,
    sections: {
      MODIFICATION_DESCRIPTION: modificationDescription,
      USER_QUERY: userQuery,
      SOLUTION: solution,
      CRITERIA: criteriaArray,
    },
  });

  const mode = GPTMode.FAST;
  const maxTokens = countTokens(fullPrompt, mode) + 700;

  const rawResult = await gptExecute({
    fullPrompt,
    maxTokens,
    mode,
    outputName: 'rating',
    outputSchema: z
      .object({
        criteria: z
          .array(
            z.object({
              criteria: z.string().describe('Name of the criteria'),
              reasoning: z.string().describe('Reasoning for the rating on this criteria'),
              rating: z.number().describe('Rating for the criteria'),
            }),
          )
          .describe('Components of the final rating, from the CRITERIA section'),
      })
      .describe('Rating of the solution'),
  });

  const results = [...rawResult.result.criteria];

  if (Boolean(simpleStringFind.length)) {
    const mappedCriteria = simpleStringFind.map((test) => {
      const passessTest = solution.includes(test?.stringToFind);

      return {
        rating: passessTest ? MAX_POINTS : 0,
        criteria: 'Contains ' + test.stringToFind,
        reasoning: '',
      };
    });

    results.push(...mappedCriteria);
  }

  if (Boolean(functionReturnTypeCheck.length)) {
    const mappedCriteria = await Promise.all(
      functionReturnTypeCheck.map(async (test) => {
        const returnType = await checkFunctionReturnType({
          code: solution,
          functionName: test.functionName,
        });

        return {
          rating: returnType === test.expectedType ? MAX_POINTS : 0,
          criteria: `Function ${test.functionName} returns ${test.expectedType}`,
          reasoning: '',
        };
      }),
    );

    results.push(...mappedCriteria);
  }

  const finalRating = sum(results.map((c) => c.rating as number));

  return {
    finalRating,
    criteriaRatings: results,
    passes: finalRating >= TEST_PASS_RATING,
  };
}
