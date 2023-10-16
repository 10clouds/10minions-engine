import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { mutateAppendToLog } from '../../tasks/logs/mutators/mutateAppendToLog';
import { MinionTask } from '../MinionTask';
import { MinionTaskSolutionWithMeta } from '../types';

export const onProgressMade =
  (task: MinionTask) =>
  async (
    oldSolutionsWithMeta: MinionTaskSolutionWithMeta[],
    accepted: MinionTaskSolutionWithMeta[],
    rejected: MinionTaskSolutionWithMeta[],
    newSolutions: MinionTaskSolutionWithMeta[],
    iteration: number,
  ) => {
    await writeFile(
      path.join(__dirname, 'logs', `${iteration}.json`),
      JSON.stringify({ iteration, accepted, rejected, newSolutions }, null, 2),
      'utf8',
    );
    mutateAppendToLog(
      task,
      `Solutions ${oldSolutionsWithMeta.map((s) => s.solution).join(', ')}`,
    );

    for (const solutionWithMeta of accepted) {
      mutateAppendToLog(
        task,
        `New best ${iteration}: ${solutionWithMeta.solution} ${solutionWithMeta.totalFitness} (${solutionWithMeta.createdWith}).`,
      );
    }
  };
