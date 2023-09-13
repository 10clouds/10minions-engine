import { KeyOfType } from '../typescript/KeyOfType';
import { weightedRandomElement } from './weightedRandomElement';

export function weightedRandomElements<T extends { weight: number }>(options: T[], attr: KeyOfType<T, number>, _count: number, random = Math.random): T[] {
  const ret: T[] = [];
  const count = Math.max(0, _count);

  while (ret.length < count && options.length > 0) {
    ret.push(weightedRandomElement(options, attr, random));
  }

  if (ret.length !== count) {
    throw new Error('Something wrong with the options, unable to generate viable result');
  }

  return ret;
}
