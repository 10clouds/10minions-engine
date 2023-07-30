import { getRandomInt } from "./getRandomInt";


export function getRandomIndex<T>(arr: T[], random = Math.random): number {
  if (arr.length === 0) {
    throw new Error('Empty array');
  }
  return getRandomInt(0, arr.length - 1, random);
}
