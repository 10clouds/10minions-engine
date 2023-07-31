import { getRandomIndex } from './getRandomIndex';

export function getRandomElement<T>(arr: T[], random = Math.random): T {
  return arr[getRandomIndex(arr, random)];
}
