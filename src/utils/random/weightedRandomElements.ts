import { KeyOfType } from '../typescript/KeyOfType';
import { weightedRandomElement } from './weightedRandomElement';

export function weightedRandomElements<T extends { weight: number }>(options: T[], attr: KeyOfType<T, number>, _count: number, random = Math.random): T[] {
  const ret: T[] = [];
  const count = Math.max(0, _count);

  while (ret.length < count) {
    const e = weightedRandomElement(options, attr, random);
    if (e == null) break;
    ret.push(e);
  }

  if (ret.length !== count) {
    throw new Error('Something wrong with the options, unable to generate viable result');
  }

  return ret;
}
