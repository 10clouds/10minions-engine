import { getRandomElement } from '../utils/random/getRandomElement';
import { type SolutionWithMeta } from './FitnessFunction';
import { FitnessObserver } from './FitnessObserver';

export async function stepEvolve<S>({
  initialSolutions,
  threshold,
  startIterationFrom = 0,
  maxNumIterations,
  maxStaleIterations,
  observers,
}: {
  initialSolutions: SolutionWithMeta<S>[];
  threshold: number;
  startIterationFrom?: number;
  maxNumIterations: number;
  maxStaleIterations: number;
  observers: FitnessObserver<S>[];
}): Promise<SolutionWithMeta<S>> {
  const current = initialSolutions.slice();

  current.sort((a, b) => b.fitness - a.fitness);

  let currentIteration = startIterationFrom;
  let lastChangeIteration = startIterationFrom;

  await Promise.all(observers.map((o) => o.onInitialSolutions?.(current, currentIteration)));

  while (true) {
    if (current[0].fitness >= threshold) {
      console.log('Threshold reached');
      break;
    }

    if (currentIteration > maxNumIterations) {
      console.log('Max iterations reached');
      break;
    }

    if (maxStaleIterations && currentIteration - lastChangeIteration > maxStaleIterations) {
      console.log('Max stale iterations reached');
      break;
    }

    currentIteration++;

    const candidateSolutions = await getRandomElement(current).nextPossibleSolutions();

    for (const candidateSolution of candidateSolutions) {
      candidateSolution.iteration = currentIteration;
    }

    if (candidateSolutions.length === 0) {
      throw new Error('No candidates available');
    }

    for (const candidate of candidateSolutions) {
      if (candidate.fitness > current[current.length - 1].fitness) {
        await Promise.all(observers.map((o) => o.onAccept?.(current, candidate, currentIteration)));
        current[current.length - 1] = candidate;
        lastChangeIteration = currentIteration;
        current.sort((a, b) => b.fitness - a.fitness);
      } else {
        await Promise.all(observers.map((o) => o.onReject?.(current, candidate, currentIteration)));
      }

      await Promise.all(observers.map((o) => o.onProgressMade?.(current, currentIteration)));

      await new Promise((r) => {
        setTimeout(r, 0);
      });
    }
  }

  await Promise.all(observers.map((o) => o.onFinalSolution?.(current[0], currentIteration)));

  return current[0];
}
