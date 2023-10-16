import { KeyOfType } from '../typescript/KeyOfType';
import { weightedRandomElement } from './weightedRandomElement';

export function weightedRandomElements<T extends { weight: number }>(
  options: T[],
  attr: KeyOfType<T, number>,
  count: number,
  random = Math.random,
): T[] {
  const ret: T[] = [];
  const maximumCount = Math.max(0, count);

  while (ret.length < maximumCount && options.length > 0) {
    ret.push(weightedRandomElement(options, attr, random));
  }

  if (ret.length !== maximumCount) {
    throw new Error(
      'Something wrong with the options, unable to generate viable result',
    );
  }

  return ret;
}
