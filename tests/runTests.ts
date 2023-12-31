import glob from 'glob';
import Mocha from 'mocha';
import * as path from 'path';

import { initCLISystems } from '../src/CLI/setupCLISystems';

export function run(): Promise<void> {
  initCLISystems();

  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 600000,
    //diff: true,
    //bail: true,
    // grep: 'Incorrectly generated diff #5',
  });

  const testsRoot = path.resolve(__dirname);

  return new Promise((c, e) => {
    glob(
      '**/**.test.ts',
      { cwd: testsRoot },
      (err: Error | null, files: string[]) => {
        if (err) {
          return e(err);
        }

        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          mocha.run((failures) => {
            if (failures > 0) {
              e(new Error(`${failures} tests failed.`));
            } else {
              c();
            }
          });
        } catch (err) {
          console.error(err);
          e(err);
        }
      },
    );
  });
}

run();
