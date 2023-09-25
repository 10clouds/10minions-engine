import * as assert from 'assert';
import { writeFile } from 'node:fs/promises';
import { existsSync, lstatSync, readFileSync } from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { setupCLISystemsForTest } from '../../src/CLI/setupCLISystems';
import { applyModificationProcedure } from '../../src/minionTasks/applyModificationProcedure';
import { createModificationProcedure } from '../../src/minionTasks/createModificationProcedure';
import { extractFileNameFromPath } from '../../src/utils/extractFileNameFromPath';
import { WorkspaceFilesKnowledge } from '../../src/minionTasks/generateDescriptionForWorkspaceFiles';

suite('Create procedure test suite', () => {
  const baseDir = path.resolve(__dirname);

  const allPaths = glob.sync(path.resolve(baseDir, '*'));
  const testDirs = allPaths.filter((path) => lstatSync(path).isDirectory());

  setupCLISystemsForTest();

  for (const testDir of testDirs) {
    test(testDir, async () => {
      const testOriginalFilePath = glob.sync(`${testDir}/*.original.txt`, {
        cwd: path.join(__dirname, testDir),
      })[0];

      const originalFileURI = testOriginalFilePath ? testOriginalFilePath : path.resolve(baseDir, testDir, 'original.txt');
      const filename = testOriginalFilePath ? extractFileNameFromPath(testOriginalFilePath) : '';
      const currentCode = readFileSync(originalFileURI, 'utf8');
      const modification = readFileSync(path.resolve(baseDir, testDir, 'modification.txt'), 'utf8');
      const expectedOutput = readFileSync(path.resolve(baseDir, testDir, 'result.txt'), 'utf8');
      const knowledegePath = path.resolve(baseDir, testDir, 'knowledge.json');
      let knowledge: WorkspaceFilesKnowledge[] = [];

      if (existsSync(knowledegePath)) {
        knowledge = JSON.parse(readFileSync(knowledegePath, 'utf8'));
      }

      const { result: procedure } = await createModificationProcedure(
        currentCode,
        modification,
        async () => {},
        () => false,
        filename,
        knowledge,
      );

      writeFile(path.resolve(baseDir, testDir, 'procedure.txt'), procedure, 'utf-8');

      let modifiedContent;
      try {
        modifiedContent = await applyModificationProcedure(currentCode, procedure, 'typescript');
      } catch (e) {
        const error = e as Error;
        modifiedContent = error.toString();
      }

      // This is helper for creating and review test for developer - dont remove it
      // if (modifiedContent) {
      //   writeFile(path.resolve(baseDir, testDir, 'modifiedContent.txt'), modifiedContent, 'utf-8');
      // }
      assert.strictEqual(modifiedContent, expectedOutput);
    });
  }
});
