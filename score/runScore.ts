import { readFile, writeFile } from 'node:fs/promises';

import { mapLimit } from 'async';
import chalk from 'chalk';
import { OptionValues, program } from 'commander';
import { format as dtFormat } from 'date-and-time';
import { existsSync, unlinkSync } from 'fs';
import * as glob from 'glob';
import { Validator } from 'jsonschema'; // Imported the jsonschema library
import path from 'path';

import {
  initCLISystems,
  setupCLISystemsForTest,
} from '../src/CLI/setupCLISystems';
import { WorkspaceFilesKnowledge } from '../src/minionTasks/generateDescriptionForWorkspaceFiles';
import { mutateExecuteMinionTaskStages } from '../src/minionTasks/mutateExecuteMinionTaskStages';
import { mutatorApplyMinionTask } from '../src/minionTasks/mutators/mutateApplyMinionTask';
import { mutateRunTaskStages } from '../src/tasks/mutators/mutateRunTaskStages';
import { initMinionTask } from './initTestMinionTask';
import { rateMinionTask } from './rateMinionTask';
import {
  functionReturnTypeCheckSchema,
  gptAssertSchema,
  simpleStringFindSchema,
  TestDefinition,
  TestInfo,
} from './types';
import { logFilePath, logToFile } from './utils/logToFile';
interface ScoringTestOptions extends OptionValues {
  iterations: number;
  pattern?: string;
  concurrency: number;
}

export const TestDefinitionSchema = {
  id: '/TestDefinition',
  oneOf: [
    gptAssertSchema,
    simpleStringFindSchema,
    functionReturnTypeCheckSchema,
  ],
};

const defaultIternationsNumber = 10;

async function runTest({
  fileName,
  iterations = defaultIternationsNumber,
  testQueueName,
}: {
  fileName: string;
  iterations?: number;
  testQueueName?: string;
}): Promise<void> {
  const tests: TestDefinition[] = JSON.parse(
    await readFile(
      path.join(__dirname, 'score', `${fileName}/tests.json`),
      'utf8',
    ),
  ) as TestDefinition[];

  // Create a validator instance
  const validator = new Validator();

  // Validate each test in the tests array against the TestDefinitionSchema
  for (const test of tests) {
    const validation = validator.validate(test, TestDefinitionSchema);

    // If validation fails, throw error with details
    if (!validation.valid) {
      throw new Error(
        `Test validation failed for '${fileName}': ${validation.errors.join(
          ', ',
        )}`,
      );
    }
  }
  const testPath = path.join(__dirname, 'score', fileName);
  const userQuery = await readFile(
    path.join(testPath, `userQuery.txt`),
    'utf8',
  );
  const knowledgePath = path.resolve(__dirname, testPath, 'knowledge.json');
  let knowledge: WorkspaceFilesKnowledge[] = [];

  if (existsSync(knowledgePath)) {
    knowledge = JSON.parse(
      await readFile(knowledgePath, 'utf8'),
    ) as WorkspaceFilesKnowledge[];
  }

  const statistics = {
    total: 0,
    passed: 0,
  };

  logToFile(`Running test for '${fileName} (${iterations} iterations)'`);
  console.log(`Running test for '${fileName} (${iterations} iterations)'`);
  const directoryPath = path.resolve(__dirname, `score/${fileName}/temp.txt`);
  const testInfoPath = path.resolve(
    __dirname,
    `score/${fileName}/testInfo.json`,
  );
  const originalFileContent = await readFile(
    path.join(__dirname, 'score', `${fileName}/original.txt`),
    'utf8',
  );
  const testInfo = JSON.parse(
    await readFile(
      path.join(__dirname, 'score', `${fileName}/testInfo.json`),
      'utf8',
    ),
  ) as TestInfo;

  for (let i = 0; i < iterations; i++) {
    setupCLISystemsForTest();
    logToFile(`Iteration ${i + 1} of ${iterations}`);
    console.log('ITERATION: ', i, ` of ${fileName}`);
    writeFile(directoryPath, originalFileContent, 'utf8');
    const minionTaskFilePath = path.join(
      __dirname,
      'score',
      `${fileName}/temp.txt`,
    );
    const { execution } = await initMinionTask(
      userQuery,
      minionTaskFilePath,
      undefined,
      fileName,
    );
    execution.relevantKnowledge = knowledge;
    await mutateRunTaskStages(
      execution,
      mutateExecuteMinionTaskStages,
      undefined,
      true,
    );
    console.log('STRATEGY: ', execution.strategyId);
    logToFile(`Strategy of ${i + 1} of iteration is ${execution.strategyId}`);

    await mutatorApplyMinionTask(execution);
    const resultingCode = (await execution.document()).getText();
    const { finalRating, passes, criteriaRatings } = await rateMinionTask(
      execution,
      resultingCode,
      tests,
    );

    console.log('RATING: ', finalRating);
    console.log('PASSES: ', passes);
    console.log('CRITERIA: ', criteriaRatings);

    statistics.total++;
    if (passes) {
      statistics.passed++;
    }

    unlinkSync(directoryPath);
  }

  const score = ((100 * statistics.passed) / statistics.total).toFixed();
  const previousResults = testInfo.testResults;
  testInfo.testResults = [
    ...previousResults,
    {
      score: `${score}%`,
      date: dtFormat(new Date(), 'YYYY-MM-DD_HH-mm-ss'),
      testQueueName,
      iterations,
    },
  ];
  writeFile(testInfoPath, JSON.stringify(testInfo), 'utf8');

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
      testQueueName: options.testQueueName as string,
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
    (value) => parseInt(value, 10),
    defaultIternationsNumber, //  based on the previous definition
  )
  .option('-p, --pattern <pattern>', 'File patterns to run tests on', '*')
  .option(
    '-n, --testQueueName <testQueueName>',
    'File name for tests queue',
    'routine tests',
  )
  .option(
    '-c, --concurrency <concurency>',
    'Number of concurrent tests',
    (value) => parseInt(value, 10),
    1,
  )
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
