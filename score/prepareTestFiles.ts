import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import fs from 'fs';
import path from 'path';

import { WorkspaceFilesKnowledge } from '../src/minionTasks/generateDescriptionForWorkspaceFiles';
import { extractFileNameFromPath } from '../src/utils/extractFileNameFromPath';
import { prepareScoreTest } from './prepareScoreTest';

export interface TestRequiredData {
  selectedText: string;
  originalContent: string;
  finalContent: string;
  userQuery: string;
  modificationProcedure: string;
  modificationDescription: string;
  documentURI: string;
  id: string;
  pluginVersion: string;
  vsCodeVersion: string;
  relevantKnowledge: WorkspaceFilesKnowledge[];
}

enum TestType {
  SCORE,
  REPLACE_PROCEDURE,
  CREATE_PROCEDURE,
}

type TestLanguages = 'typescript' | 'javascript';

const TestLanguagesExtensions: Record<TestLanguages, string> = {
  javascript: 'js',
  typescript: 'ts',
};

interface TestConfig {
  id: string;
  testName: string;
  testType: TestType;
  withSelectedText: boolean;
  language: TestLanguages;
}

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const baseDir = path.resolve(__dirname);
const serviceAccount = JSON.parse(
  readFileSync(path.resolve(baseDir, '../src/CLI/serviceAccount.json'), 'utf8'),
) as admin.ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const REPLACE_PROCEDURE_TEST_FILE_PATH = '../tests/replaceProcedure';
const CREATE_PROCEDURE_TEST_FILE_PATH = '../tests/createProcedure';
const SCORE_TEST_FILE_PATH = 'score';

const getTestFilePath = (testType: TestType) => {
  return {
    [TestType.SCORE]: SCORE_TEST_FILE_PATH,
    [TestType.REPLACE_PROCEDURE]: REPLACE_PROCEDURE_TEST_FILE_PATH,
    [TestType.CREATE_PROCEDURE]: CREATE_PROCEDURE_TEST_FILE_PATH,
  }[testType];
};

function createTestsDirectory(testType: TestType, testName: string): string {
  const directoryName = getTestFilePath(testType);
  const directoryPath = path.resolve(__dirname, directoryName);
  const testDirPath = `${directoryPath}/${testName}`;

  if (!fs.existsSync(testDirPath)) {
    fs.mkdirSync(testDirPath);
  }

  return testDirPath;
}

function createTestFile(content: string, fileName: string) {
  const directoryPath = path.resolve(__dirname, fileName);

  if (!fs.existsSync(directoryPath)) {
    fs.writeFileSync(directoryPath, content);
  }
}

const createTestInfoFile = (testData: TestRequiredData, path: string) => {
  const { id, pluginVersion, vsCodeVersion, documentURI } = testData;
  const fileName = extractFileNameFromPath(documentURI);
  const testInfo = {
    originalFilePath: fileName,
    minionTaskId: id,
    pluginVersion,
    vsCodeVersion,
    date: getTodayDate(),
  };

  createTestFile(JSON.stringify(testInfo), `${path}/testInfo.json`);
};

const createScoreTestFiles = async (
  testData: TestRequiredData,
  config: TestConfig,
): Promise<void> => {
  const {
    selectedText,
    originalContent,
    userQuery,
    relevantKnowledge = [],
  } = testData;
  const languageFileExtension = TestLanguagesExtensions[config.language];
  const testDirPath = createTestsDirectory(
    config.testType,
    `${config.testName}.${languageFileExtension}`,
  );
  const testFileNamePrefix = `${testDirPath}/`;
  createTestInfoFile(testData, testFileNamePrefix);

  if (config.withSelectedText) {
    createTestFile(selectedText, `${testFileNamePrefix}selectedText.txt`);
  }
  createTestFile(originalContent, `${testFileNamePrefix}original.txt`);
  createTestFile(userQuery, `${testFileNamePrefix}userQuery.txt`);
  createTestFile(
    JSON.stringify(relevantKnowledge),
    `${testFileNamePrefix}knowledge.json`,
  );
  const test = await prepareScoreTest(
    userQuery,
    `${config.testName}.${languageFileExtension}`,
    testData,
  );
  createTestFile(test ?? '', `${testFileNamePrefix}tests.json`);
};

const createProcedureTestFiles = async (
  testData: TestRequiredData,
  config: TestConfig,
) => {
  const {
    finalContent,
    originalContent,
    modificationDescription,
    modificationProcedure,
    relevantKnowledge,
  } = testData;
  const testDirPath = createTestsDirectory(config.testType, config.testName);
  const testFileNamePrefix = `${testDirPath}/`;
  const originalFileName = extractFileNameFromPath(testData.documentURI);
  createTestInfoFile(testData, testFileNamePrefix);

  if (config.testType === TestType.CREATE_PROCEDURE) {
    createTestFile(
      modificationDescription,
      `${testFileNamePrefix}modification.txt`,
    );
    createTestFile(
      JSON.stringify(relevantKnowledge),
      `${testFileNamePrefix}knowledge.json`,
    );
    createTestFile(
      originalContent,
      `${testFileNamePrefix}${originalFileName}.original.txt`,
    );
  } else {
    createTestFile(originalContent, `${testFileNamePrefix}original.txt`);
  }

  createTestFile(modificationProcedure, `${testFileNamePrefix}procedure.txt`);
  createTestFile(finalContent, `${testFileNamePrefix}result.txt`);
};

const createTestFiles = async (
  testData: TestRequiredData,
  config: TestConfig,
): Promise<void> => {
  const createFunction = {
    [TestType.SCORE]: createScoreTestFiles.bind(this, testData, config),
    [TestType.REPLACE_PROCEDURE]: createProcedureTestFiles.bind(
      this,
      testData,
      config,
    ),
    [TestType.CREATE_PROCEDURE]: createProcedureTestFiles.bind(
      this,
      testData,
      config,
    ),
  }[config.testType];
  await createFunction();
};

const collectBaseTestData = async (): Promise<
  Omit<TestConfig, 'withSelectedText' | 'language'>
> => {
  const testId = await input({
    message: 'Enter Firestore test ID ( 36 characters a-zA-Z0-9 )',
    validate: (value) => value.length === 36,
  });
  const testName = await input({
    message: 'Enter test name',
    validate: (value) => value.length > 10,
  });
  const testType = await select({
    message: 'Enter test type (replaceProcedure, createProcedure, score)',
    choices: [
      {
        name: 'replaceProcedure',
        value: TestType.REPLACE_PROCEDURE,
      },
      {
        name: 'createProcedure',
        value: TestType.CREATE_PROCEDURE,
      },
      {
        name: 'score',
        value: TestType.SCORE,
      },
    ],
  });

  console.log(`
Test config summary:
Firestore document ID: ${chalk.green(testId)}
Test name: ${chalk.green(testName)}
Test type: ${chalk.green(testType)}
`);

  const confirmResult = await confirm({ message: 'Continue?' });

  if (!confirmResult) {
    console.log(`${chalk.red('Aborted, please start again.')}`);

    return process.exit(0);
  }

  return {
    id: testId,
    testName,
    testType,
  };
};

const prepareTestFiles = async () => {
  const testConfigBase = await collectBaseTestData();

  try {
    const minionTaskSnapshot = await admin
      .firestore()
      .collection('minionTasks')
      .where('id', '==', testConfigBase.id)
      .limit(1)
      .get();

    // it will always return 1 document since we've added the limit above, and
    // to proper functionality the document ID should be used not the ID from the collection doc itself
    minionTaskSnapshot.forEach((doc) => {
      createTestFiles(doc.data() as TestRequiredData, {
        ...testConfigBase,
        withSelectedText: true,
        language: 'typescript',
      });
    });
  } catch (error) {
    console.error(error);
  }
};

prepareTestFiles().catch((error) => console.error(error));
