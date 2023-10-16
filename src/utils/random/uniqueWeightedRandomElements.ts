import { KeyOfType } from '../typescript/KeyOfType';
import { weightedRandomElement } from './weightedRandomElement';

export function uniqueWeightedRandomElements<T extends { weight: number }>(
  options: T[],
  attr: KeyOfType<T, number>,
  count: number,
  random = Math.random,
): T[] {
  const ret: T[] = [];
  const maximumCount = Math.max(0, count);
  let remainingOptions = options.slice();

  while (ret.length < maximumCount && remainingOptions.length > 0) {
    ret.push(weightedRandomElement(remainingOptions, attr, random));
    remainingOptions = options.filter((o) => !ret.includes(o));
  }

  if (ret.length !== maximumCount) {
    throw new Error(
      'Something wrong with the options, unable to generate viable result',
    );
  }

  return ret;
}
