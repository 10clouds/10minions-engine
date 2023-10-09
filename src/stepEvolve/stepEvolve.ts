import { MinionTask } from '../minionTasks/MinionTask';
import { getRandomElement } from '../utils/random/getRandomElement';
import { type SolutionWithMeta } from './FitnessFunction';
import { FitnessObserver } from './FitnessObserver';

export async function stepEvolve<S>({
  initialSolutions,
  threshold,
  startIterationFrom = 0,
  maxNumIterations = 5,
  maxStaleIterations = 2,
  observers,
  task,
}: {
  initialSolutions: SolutionWithMeta<S>[];
  threshold: number;
  startIterationFrom?: number;
  maxNumIterations?: number;
  maxStaleIterations?: number;
  observers: FitnessObserver<S>[];
  task?: MinionTask;
}): Promise<SolutionWithMeta<S> | null> {
  if (task?.stopped) return null;

  const current = initialSolutions.slice();
  console.log('START STEP EVOLVE');
  current.sort((a, b) => b.totalFitness - a.totalFitness);

  let currentIteration = startIterationFrom;
  let lastChangeIteration = startIterationFrom;

  await Promise.all(
    observers.map((o) => o.onInitialSolutions?.(current, currentIteration)),
  );
  while (!task?.stopped) {
    if (current[0].totalFitness >= threshold) {
      console.log('Threshold reached');
      break;
    }

    if (currentIteration > maxNumIterations) {
      console.log('Max iterations reached');
      break;
    }

    if (
      maxStaleIterations &&
      currentIteration - lastChangeIteration > maxStaleIterations
    ) {
      console.log('Max stale iterations reached');
      break;
    }

    currentIteration++;

    const candidateSolutions =
      await getRandomElement(current).nextPossibleSolutions();

    if (candidateSolutions.length === 0) {
      throw new Error('No candidates available');
    }
    for (const candidateSolution of candidateSolutions) {
      candidateSolution.iteration = currentIteration;
    }

    const oldCurrent = current.slice();
    const accepted: SolutionWithMeta<S>[] = [];
    const rejected: SolutionWithMeta<S>[] = [];

    for (const candidate of candidateSolutions) {
      if (candidate.totalFitness > current[current.length - 1].totalFitness) {
        current[current.length - 1] = candidate;
        lastChangeIteration = currentIteration;
        current.sort((a, b) => b.totalFitness - a.totalFitness);
        accepted.push(candidate);
      } else {
        rejected.push(candidate);
      }
    }

    await Promise.all(
      observers.map(
        (o) =>
          o.onProgressMade?.(
            oldCurrent,
            accepted,
            rejected,
            current,
            currentIteration,
          ),
      ),
    );
    await new Promise((r) => {
      setTimeout(r, 0);
    });
  }

  await Promise.all(
    observers.map((o) => o.onFinalSolution?.(current[0], currentIteration)),
  );

  return current[0];
}
