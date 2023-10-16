import { SolutionWithMeta } from '../../stepEvolve/FitnessFunction';
import { mutateAppendToLog } from '../../tasks/logs/mutators/mutateAppendToLog';
import { MinionTask } from '../MinionTask';
import { MinionTaskSolution } from '../types';

export const onFinalSolution =
  (task: MinionTask) =>
  async (
    solutionWithMeta: SolutionWithMeta<MinionTaskSolution>,
    iteration: number,
  ) => {
    const {
      totalFitness,
      solution: { resultingCode },
      iteration: solutionIteration,
    } = solutionWithMeta;

    mutateAppendToLog(task, 'Final solution is:');
    mutateAppendToLog(task, '```');
    mutateAppendToLog(task, resultingCode);
    mutateAppendToLog(task, '```');
    mutateAppendToLog(task, `Fitness: ${totalFitness}`);
    mutateAppendToLog(
      task,
      `Iteration: ${iteration} (Best solution found in iteration: ${solutionIteration})`,
    );
  };
