import { type SolutionWithMeta } from './FitnessFunction';
import { FitnessObserver } from './FitnessObserver';

export async function stepEvolve<S>({
  initialSolution, threshold, startIterationFrom = 0, maxNumIterations, observers
}: {
  initialSolution: SolutionWithMeta<S>;
  threshold: number;
  startIterationFrom?: number;
  maxNumIterations: number;
  observers: FitnessObserver<S>[];
}): Promise<SolutionWithMeta<S>> {
  let current = initialSolution;

  let currentIteration = startIterationFrom;

  await Promise.all(observers.map((o) => o.onInitialSolution?.(current, currentIteration)));

  while (current.fitness < threshold && currentIteration < maxNumIterations) {
    let candidateSolutions = await current.nextPossibleSolutions();
    
    for (let candidateSolution of candidateSolutions) {
      candidateSolution.iteration = currentIteration;
    }
    
    if (candidateSolutions.length === 0) {
      throw new Error('No candidates available');
    }

    for (let candidate of candidateSolutions) {
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
    };
  }

  await Promise.all(observers.map((o) => o.onFinalSolution?.(current, currentIteration)));

  return current;
}


//currentSolutionString = convertToConsistncyCheckString(env.obj);
  //let currentSolutionString = convertToConsistncyCheckString(serializeT(currentSolution));
/*
        const newString = convertToConsistncyCheckString(serializeT(currentSolution));

        if (currentSolutionString !== newString) {
          writeFileSync('tmpReferenceDeck.json', currentSolutionString);
          writeFileSync('tmpNewDeck.json', newString);
          throw new Error('Inconsistency detected (JSON)');
        }

        if (referenceFitness !== env.calculate(fitness)) throw new Error('Inconsistency detected (fitness)');*/



  /*env = env.edit((obj) => {
    obj.addToHistory(`${env.obj.id} moved ${currentFitness.fitness} towards ${threshold}, reference: ${referenceFitness} after: ${afterFitness}`);
  });*/