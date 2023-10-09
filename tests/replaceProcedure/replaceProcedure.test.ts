import { readFile } from 'node:fs/promises';

import * as assert from 'assert';
import { lstatSync } from 'fs';
import * as glob from 'glob';
import * as path from 'path';

import { applyModificationProcedure } from '../../src/minionTasks/applyModificationProcedure';

suite('Replace Procedure Test Suite', () => {
  const baseDir = path.resolve(__dirname);

  const allPaths = glob.sync(path.resolve(baseDir, '*'));
  const testDirs = allPaths.filter((path) => lstatSync(path).isDirectory());

  for (const testDir of testDirs) {
    test(path.basename(testDir), async () => {
      const currentCode = await readFile(
        path.resolve(baseDir, testDir, 'original.txt'),
        'utf8',
      );
      const procedure = await readFile(
        path.resolve(baseDir, testDir, 'procedure.txt'),
        'utf8',
      );
      const expectedOutput = await readFile(
        path.resolve(baseDir, testDir, 'result.txt'),
        'utf8',
      );

      let modifiedContent;
      try {
        modifiedContent = await applyModificationProcedure(
          currentCode,
          procedure,
          'typescript',
        );
      } catch (e: unknown) {
        if (e instanceof Error) {
          modifiedContent = e.toString();
        }
      }
      // This is helper to creating and review test for developer - dont remove it
      // if (modifiedContent) {
      //    writeFile(path.resolve(baseDir, testDir, 'modifiedContent.txt'), modifiedContent, 'utf-8');
      // }

      assert.strictEqual(modifiedContent, expectedOutput);
    });
  }
});
