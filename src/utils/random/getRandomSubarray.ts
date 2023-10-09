import { shuffleArray } from './shuffleArray';

export function getRandomSubarray<T>(
  arr: T[],
  size: number,
  uniqueKey?: (item: T) => string,
  random = Math.random,
): T[] {
  const shuffled = arr.slice(0);
  shuffleArray(shuffled, random);

  if (uniqueKey) {
    const r: T[] = [];
    const usedDict: { [key: string]: boolean } = {};

    for (const item of shuffled) {
      if (r.length >= size) break;

      if (!usedDict[uniqueKey(item)]) {
        r.push(item);
        usedDict[uniqueKey(item)] = true;
      }
    }

    return r;
  }

  return shuffled.slice(0, size);
}
