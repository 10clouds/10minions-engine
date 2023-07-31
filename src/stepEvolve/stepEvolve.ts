import { type SolutionWithMeta } from './FitnessFunction';
import { FitnessObserver } from './FitnessObserver';

export async function stepEvolve<S>({
  initialSolution,
  threshold,
  startIterationFrom = 0,
  maxNumIterations,
  maxStaleIterations,
  observers,
}: {
  initialSolution: SolutionWithMeta<S>;
  threshold: number;
  startIterationFrom?: number;
  maxNumIterations: number;
  maxStaleIterations: number;
  observers: FitnessObserver<S>[];
}): Promise<SolutionWithMeta<S>> {
  let current = initialSolution;

  let currentIteration = startIterationFrom;

  await Promise.all(observers.map((o) => o.onInitialSolution?.(current, currentIteration)));

  while (true) {
    if (current.fitness >= threshold) {
      console.log('Threshold reached');
      break;
    }

    if (currentIteration > maxNumIterations) {
      console.log('Max iterations reached');
      break;
    }

    if (maxStaleIterations && currentIteration - current.iteration > maxStaleIterations) {
      console.log('Max stale iterations reached');
      break;
    }

    const candidateSolutions = await current.nextPossibleSolutions();

    for (const candidateSolution of candidateSolutions) {
      candidateSolution.iteration = currentIteration;
    }

    if (candidateSolutions.length === 0) {
      throw new Error('No candidates available');
    }

    for (const candidate of candidateSolutions) {
      if (candidate.fitness > current.fitness) {
        await Promise.all(observers.map((o) => o.onAccept?.(current, candidate, currentIteration)));
        current = candidate;
      } else {
        await Promise.all(observers.map((o) => o.onReject?.(current, candidate, currentIteration)));
      }

      await Promise.all(observers.map((o) => o.onProgressMade?.(current, currentIteration)));

      currentIteration++;
      await new Promise((r) => {
        setTimeout(r, 0);
      });
    }
  }

  await Promise.all(observers.map((o) => o.onFinalSolution?.(current, currentIteration)));

  return current;
}
