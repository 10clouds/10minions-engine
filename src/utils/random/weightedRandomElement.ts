import { KeyOfType } from '../typescript/KeyOfType';
import { weightedRandomIndex } from './weightedRandomIndex';

/**
 *
 * @param options
 * @param random
 * @returns element or null if weights all are non-positive
 */

export function weightedRandomElement<T>(options: T[], attr: KeyOfType<T, number>, random = Math.random): T {
  if (options.length === 0) throw new Error('Empty options');
  const index = weightedRandomIndex(options, attr, random);
  return options[index];
}
