import { mapLimit } from 'async';
import chalk from 'chalk';
import { OptionValues, program } from 'commander';
import { format as dtFormat } from 'date-and-time';
import fs from 'fs';
import * as glob from 'glob';
import { Validator } from 'jsonschema'; // Imported the jsonschema library
import path from 'path';
import ts from 'typescript';
import { z } from 'zod';
import { initCLISystems, setupCLISystemsForTest } from '../src/CLI/setupCLISystems';
import { gptExecute } from '../src/gpt/gptExecute';
import { GPTMode } from '../src/gpt/types';
import { LOG_PLAIN_COMMENT_MARKER as LOG_FALLBACK_COMMENT_MARKER } from '../src/minionTasks/mutators/mutateApplyFallback';
import { LOG_NO_FALLBACK_MARKER as LOG_NORMAL_MODIFICATION_MARKER, mutatorApplyMinionTask } from '../src/minionTasks/mutators/mutateApplyMinionTask';
import { mutateRunTaskStages } from '../src/tasks/mutators/mutateRunTaskStages';

// main types

import { countTokens } from '../src/gpt/countTokens';
import { mutateExecuteMinionTaskStages } from '../src/minionTasks/mutateExecuteMinionTaskStages';
import { initMinionTask } from './initTestMinionTask';
import { TestDefinition, functionReturnTypeCheckSchema, gptAssertSchema, simpleStringFindSchema } from './types';

interface ScoringTestOptions extends OptionValues {
  iterations: number;
  pattern?: string;
  concurrency: number;
}

export const TestDefinitionSchema = {
  id: '/TestDefinition',
  oneOf: [gptAssertSchema, simpleStringFindSchema, functionReturnTypeCheckSchema],
};

const defaultIternationsNumber = 10;

async function checkFunctionReturnType({ code, functionName }: { code: string; functionName: string }): Promise<string> {
  try {
    // Create and compile program
    // Create an in-memory source file
    const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.ES2015, true);

    // Create an in-memory compiler host
    const compilerHost: ts.CompilerHost = {
      ...ts.createCompilerHost({}),
      getSourceFile: (fileName) => (fileName === 'temp.ts' ? sourceFile : undefined),
      readFile: (fileName) => (fileName === 'temp.ts' ? code : undefined),
    };

    // Create and compile program with the in-memory compiler host
    const program = ts.createProgram(['temp.ts'], {}, compilerHost);
    const checker = program.getTypeChecker();

    // Helper function to search the AST nodes for a function declaration
    function findFunctionDeclaration(node: ts.Node, functionName: string): ts.FunctionDeclaration | undefined {
      if (ts.isFunctionDeclaration(node) && node.name && node.name.text === functionName) {
        return node;
      }

      let functionDecl: ts.FunctionDeclaration | undefined;
      ts.forEachChild(node, (childNode) => {
        if (functionDecl) return;
        functionDecl = findFunctionDeclaration(childNode, functionName);
      });

      return functionDecl;
    }

    // Find function declaration
    const funcDecl = findFunctionDeclaration(sourceFile, functionName);

    if (!funcDecl?.name) {
      throw new Error(`Function '${functionName}' not found in code.`);
    }

    const funcSym = checker.getSymbolAtLocation(funcDecl?.name);

    if (!funcSym || !funcSym.valueDeclaration) {
      throw new Error(`Symbol not found for function '${functionName}'. Ensure the function exists and is correctly spelled.`);
    }

    const typeOfFuncSym = checker.getTypeOfSymbolAtLocation(funcSym, funcSym.valueDeclaration);

    const returnType = checker.getReturnTypeOfSignature(typeOfFuncSym.getCallSignatures()[0]);

    return checker.typeToString(returnType);
  } catch (error) {
    logToFile(`Error during return type check: ${error instanceof Error ? error.message : error}`);

    return 'Error during return type check';
  }
}

const directoryPath = path.join(__dirname, 'logs');
// Added the Date object to get the current date and time and formatted it as per requirement (YYYY-MM-DD_HH-MM-SS).
const logFilename = `log_${dtFormat(new Date(), 'YYYY-MM-DD_HH-mm-ss')}.log`;

// Concatenating date_string with the filename to include the current date and time in the filename.
const logFilePath = path.join(directoryPath, logFilename);

function logToFile(logMessage: string) {
  // Check if logs directory exist or not
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath); // If logs directory does not exist, create it
  }

  fs[fs.existsSync(logFilePath) ? 'appendFileSync' : 'writeFileSync'](logFilePath, logMessage + '\n');
}

async function gptAssert({
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
        comment: z.string().describe('Describe the reason for why the code passed (or did not pass) the test.'),
        passessTest: z.boolean().describe('Whether the code passed the test or not.'),
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

async function runTest({ fileName, iterations = defaultIternationsNumber }: { fileName: string; iterations?: number }): Promise<void> {
  const tests: TestDefinition[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'score', `${fileName}/tests.json`), 'utf8'));

  // Create a validator instance
  const validator = new Validator();

  // Validate each test in the tests array against the TestDefinitionSchema
  for (const test of tests) {
    const validation = validator.validate(test, TestDefinitionSchema);

    // If validation fails, throw error with details
    if (!validation.valid) {
      throw new Error(`Test validation failed for '${fileName}': ${validation.errors.join(', ')}`);
    }
  }

  const userQuery = fs.readFileSync(path.join(__dirname, 'score', `${fileName}/userQuery.txt`), 'utf8');

  const statistics = {
    total: 0,
    passed: 0,
  };

  logToFile(`Running test for '${fileName} (${iterations} iterations)'`);
  console.log(`Running test for '${fileName} (${iterations} iterations)'`);
  const directoryPath = path.resolve(__dirname, `score/${fileName}/temp.txt`);
  const testInfoPath = path.resolve(__dirname, `score/${fileName}/testInfo.json`);
  const originalFileContent = fs.readFileSync(path.join(__dirname, 'score', `${fileName}/original.txt`), 'utf8');
  const testInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'score', `${fileName}/testInfo.json`), 'utf8'));

  for (let i = 0; i < iterations; i++) {
    setupCLISystemsForTest();
    logToFile(`Iteration ${i + 1} of ${iterations}`);
    console.log('ITERATION: ', i, ` of ${fileName}`);
    fs.writeFileSync(directoryPath, originalFileContent);

    const { execution } = await initMinionTask(userQuery, fileName, 'temp.txt');

    await mutateRunTaskStages(execution, mutateExecuteMinionTaskStages);
    await mutatorApplyMinionTask(execution);

    const resultingCode = (await execution.document()).getText();

    statistics.total++;
    const includesNormalModification = execution.logContent.includes(LOG_NORMAL_MODIFICATION_MARKER);
    const includesFallbackComment = execution.logContent.includes(LOG_FALLBACK_COMMENT_MARKER);

    if (includesNormalModification && !includesFallbackComment) {
      logToFile(`Test passed: No fallback`);
      statistics.passed++;
    } else {
      if (includesNormalModification) {
        logToFile(`Test failed: Includes both normal modification & fallback comment `);
      } else if (!includesFallbackComment) {
        logToFile(`Test failed: No modification (normal or fallback)`);
      } else {
        logToFile(`Test failed: Fallback comment applied`);
      }
    }
    for (const test of tests) {
      statistics.total++;

      if (test.type === 'gptAssert') {
        const { passessTest, comment } = await gptAssert({
          originalCode: execution.originalContent,
          resultingCode,
          assertion: test.assertion,
        });
        console.log('ASSERTION: ', test.assertion);
        console.log('PASSES:', passessTest);
        console.log('COMMENT:', comment);
        if (!passessTest) {
          logToFile(`Test failed: ${test.assertion}`);
          logToFile(`Comment: ${comment}`);
        } else {
          logToFile(`Test passed: ${test.assertion}`);
          logToFile(`Comment: ${comment}`);
          statistics.passed++;
        }
      } else if (test.type === 'simpleStringFind') {
        const passessTest = resultingCode.includes(test.stringToFind);
        logToFile(`Test: ${test.stringToFind}`);

        if (!passessTest) {
          logToFile(`Test failed: ${test.stringToFind}`);
        } else {
          statistics.passed++;
        }
      } else if (test.type === 'functionReturnTypeCheck') {
        const returnType = await checkFunctionReturnType({
          code: resultingCode,
          functionName: test.functionName,
        });
        logToFile(`Return type of function ${test.functionName}: ${returnType}`);

        if (returnType !== test.expectedType) {
          logToFile(`Test failed: The return type of function ${test.functionName} is not ${test.expectedType}`);
        } else {
          statistics.passed++;
        }
      }
    }

    fs.unlinkSync(directoryPath);
  }

  const score = ((100 * statistics.passed) / statistics.total).toFixed();
  testInfo.score = `${score}%`;
  fs.writeFileSync(testInfoPath, JSON.stringify(testInfo));

  console.log(`'${chalk.green(fileName)}' score: ${score}%`);
  logToFile(`'${fileName}' score: ${score}%`);
}

async function runScoring(options: ScoringTestOptions): Promise<void> {
  console.log('Running tests...');
  console.log(`Log file: ${logFilePath}`);

  logToFile('\n\nRunning tests...\n\n');

  initCLISystems();
  const testBaseNames = glob.sync(`${options.pattern}`, {
    cwd: path.join(__dirname, 'score'),
  });

  console.log('Tests: ', testBaseNames);
  await mapLimit(
    testBaseNames.map((fileName) => ({
      fileName,
      iterations: options.iterations,
    })),
    options.concurrency,
    runTest,
  );

  console.log(`Log file: ${logFilePath}`);
  console.log('Done!');
  return;
}

// TODO: move it to the isolated scope
program
  .name('AI score testing')
  .description('AI score testing ( beta )')
  .version('0.0.1')
  .option(
    '-i, --iterations <iterations>',
    'Number of iterations',
    (value) => parseInt(value),
    10, //  based on the previous definition
  )
  .option('-p, --pattern <pattern>', 'File patterns to run tests on', '*')
  .option('-c, --concurrency <concurency>', 'Number of concurrent tests', (value) => parseInt(value), 1)
  .addHelpText(
    'after',
    `
  Examples:
    $ yarn <package.json script name> // runs all tests
    $ yarn <package.json script name> -p "test*" // runs all tests that match the pattern
    $ yarn <package.json script name> -p "test*" -c 2 // runs all tests that match the pattern with concurrency of 2
    $ yarn <package.json script name> -p "test*" -i 20 // runs all tests that match the pattern with 20 iterations
  `,
  )
  .parse();

program.parse(process.argv);
runScoring(program.opts<ScoringTestOptions>())
  .catch((e) => {
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
