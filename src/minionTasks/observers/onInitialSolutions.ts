import { writeFile } from 'node:fs/promises';

import { format as dtFormat } from 'date-and-time';
import fs from 'fs';
import path from 'path';

import { SolutionWithMeta } from '../../stepEvolve/FitnessFunction';
import { mutateAppendToLog } from '../../tasks/logs/mutators/mutateAppendToLog';
import { MinionTask } from '../MinionTask';
import { MinionTaskSolution } from '../types';

export const onInitialSolutions =
  (task: MinionTask) =>
  async (
    solutionsWithMeta: SolutionWithMeta<MinionTaskSolution>[],
    iteration: number,
  ) => {
    for (const solutionWithMeta of solutionsWithMeta) {
      mutateAppendToLog(
        task,
        `Initial solution is: ${solutionWithMeta.solution} ${solutionWithMeta.totalFitness} (${solutionWithMeta.createdWith})` +
          `.`,
      );
    }
    const logsPath = path.resolve(__dirname, 'logs');

    if (!fs.existsSync(logsPath)) {
      fs.mkdirSync(logsPath, { recursive: true });
    }
    await writeFile(
      path.join(
        __dirname,
        'logs',
        `${iteration}-${dtFormat(new Date(), 'YYYY-MM-DD_HH-mm-ss')}.json`,
      ),
      JSON.stringify({ iteration, solutionsWithMeta }, null, 2),
      'utf8',
    );
  };
