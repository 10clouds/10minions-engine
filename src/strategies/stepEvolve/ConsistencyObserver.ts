import { type SolutionWithMeta } from './FitnessFunction';
import { FitnessObserver } from './FitnessObserver';

//TODO: Implement this class

/**
 * This observer checks the consistency of state while evolving the solutions using stepEvolve.
 * It checks whenever the object changed and if the fitness is still the same.
 */
export class ConsistencyObserver<S> implements FitnessObserver<S> {
  currentSolutionWithMeta: SolutionWithMeta<S> | undefined;
  currentConsistencyCheckString: string | undefined;

  onInitialSolution?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onAccept?: (oldSolutionWithMeta: SolutionWithMeta<S>, acceptedSolutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onReject?: (currentSolutionWithMeta: SolutionWithMeta<S>, rejectedSolutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onProgressMade?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
  onFinalSolution?: (solutionWithMeta: SolutionWithMeta<S>, iteration: number) => Promise<void>;
}


/*export function convertToConsistncyCheckString<T>(obj: T) {
  const data = obj.toPlainData();

  // a bit hacky ...
  if (data.timeToGenerate != null) data.timeToGenerate = 0;
  if (data.iteration != null) data.iteration = 0;
  if (data.stats?.averageTimeToGenerateDeck != null) data.stats.averageTimeToGenerateDeck = 0;

  const str = JSON.stringify({ ...data, lastReject: '' }, null, 2);
  return str;
}*/

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