import { type KeyOfType } from "../../utils/KeyOfType";

export function shuffleArray<T>(array: T[], random = Math.random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

export function getRandomElement<T>(arr: T[], random = Math.random): T {
  return arr[getRandomIndex(arr, random)];
}

export function getRandomIndex<T>(arr: T[], random = Math.random): number {
  if (arr.length === 0) {
    throw new Error('Empty array');
  }
  return getRandomInt(0, arr.length - 1, random);
}

export function getRandomSubarray<T>(arr: T[], size: number, uniqueKey?: (item: T) => string, random = Math.random): T[] {
  const shuffled = arr.slice(0);
  shuffleArray(shuffled, random);

  if (uniqueKey != null) {
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
  } else {
    return shuffled.slice(0, size);
  }
}

export function weightedRandomIndex<T>(options: T[], attr: KeyOfType<T, number>, random = Math.random): number {
  const weights: number[] = [];

  for (let i = 0; i < options.length; i++) weights[i] = Math.max(0, options[i][attr] as any as number) + (weights[i - 1] || 0);

  const r = random() * weights[weights.length - 1];

  let i = 0;
  for (i = 0; i < weights.length; i++) if (weights[i] > r) break;

  if (i >= options.length) {
    throw new Error('Something wrong with the options, unable to generate viable result');
  }

  return i;
}

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

export function uniqueWeightedRandomElements<T extends { weight: number }>(
  options: T[],
  attr: KeyOfType<T, number>,
  _count: number,
  random = Math.random,
): T[] {
  const ret: T[] = [];
  const count = Math.max(0, _count);

  while (ret.length < count) {
    const e = weightedRandomElement(
      options.filter((o) => !ret.includes(o)),
      attr,
      random,
    );
    if (e == null) break;
    ret.push(e);
  }

  if (ret.length !== count) {
    throw new Error('Something wrong with the options, unable to generate viable result');
  }

  return ret;
}

export function getRandomInt(_min: number, _max: number, random = Math.random) {
  const min = Math.ceil(_min);
  const max = Math.floor(_max);
  return Math.floor(random() * (max - min + 1)) + min;
}

export function replaceText(string: string, text: string, replacement: any) {
  return string.substr(0, string.indexOf(text)) + replacement.toString() + string.substr(string.indexOf(text) + text.length);
}

export function arraysEqual<T>(a: T[], b: T[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  const sortedA = a.slice().sort();
  const sortedB = b.slice().sort();

  for (let i = 0; i < sortedA.length; ++i) {
    if (sortedA[i] !== sortedB[i]) return false;
  }

  return true;
}

export function onlyUnique<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}

export function findDuplicates(arr: string[]): string[];
export function findDuplicates<T>(arr: T[], key: (t: T) => string): T[];
export function findDuplicates<T>(arr: T[], key: (t: T) => string = (t: T) => String(t)): T[] {
  const sortedArr = arr.slice().sort((a, b) => key(a).localeCompare(key(b)));
  const results: T[] = [];
  for (let i = 0; i < sortedArr.length - 1; i++) {
    if (key(sortedArr[i + 1]) === key(sortedArr[i])) {
      results.push(sortedArr[i]);
    }
  }
  return results;
}

export function count<T>(array: T[], query: T | ((obj: T) => boolean)): number {
  if (query instanceof Function) {
    let count = 0;
    for (let i = 0; i < array.length; i++) if (query(array[i])) count++;
    return count;
  } else {
    let count = 0;
    for (let i = 0; i < array.length; i++) if (array[i] === query) count++;
    return count;
  }
}

export function min(array: number[]): number;
export function min<T>(array: T[], query: (obj: T) => number): number;
export function min<T>(array: any[], query?: (obj: T) => number): number {
  if (query == null) {
    return (array as number[]).reduce((a, b) => (a < b ? a : b), 0);
  } else {
    return array.reduce((a, b) => {
      const bCalculated = query(b);
      return a < bCalculated ? a : bCalculated;
    }, 0);
  }
}

export function max(array: number[]): number;
export function max<T>(array: T[], query: (obj: T) => number): number;
export function max<T>(array: any[], query?: (obj: T) => number): number {
  if (query == null) {
    return (array as number[]).reduce((a, b) => (a > b ? a : b), 0);
  } else {
    return array.reduce((a, b) => {
      const bCalculated = query(b);
      return a > bCalculated ? a : bCalculated;
    }, 0);
  }
}

export function sum(array: number[]): number;
export function sum<T>(array: T[], query: (obj: T) => number): number;
export function sum<T>(array: any[], query?: (obj: T) => number): number {
  if (query == null) {
    return (array as number[]).reduce((a, b) => a + b, 0);
  } else {
    return array.reduce((a, b) => a + query(b), 0);
  }
}

export function average(array: number[]): number;
export function average<T>(array: T[], query: (obj: T) => number): number;
export function average<T>(array: any[], query?: (obj: T) => number): number {
  if (array.length === 0) {
    return 0;
  }

  if (query == null) {
    return sum(array) / array.length;
  } else {
    return sum(array, query) / array.length;
  }
}

export function median<T>(array: T[], query: (obj: T) => number): number {
  const values = array.map((v) => query(v));

  if (values.length === 0) throw new Error('No inputs');

  values.sort(function (a, b) {
    return a - b;
  });

  const half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

export function removeFirst<T>(array: T[], match: (obj: T, i: number) => boolean) {
  for (let i = 0; i < array.length; i++) {
    if (match(array[i], i)) return array.splice(i, 1)[0];
  }
}

export function matchesId<T extends { id: string }>(obj: T) {
  return (otherObj: T) => otherObj.id === obj.id;
}

export function containsId<T extends { id: string }>(array: T[], obj: T | string) {
  if (typeof obj === 'string') {
    return array.some((otherObj: T) => otherObj.id === obj);
  } else {
    return array.some(matchesId(obj));
  }
}

export function removeItemByIndex<T>(arr: T[], index: number): T[] {
  /*
    Removes an item from the array at the specified index.
    Returns a new array without the removed item.
    */
  if (index < 0 || index >= arr.length) {
    throw new Error('Index out of range.');
  }
  const newArray: T[] = [...arr.slice(0, index), ...arr.slice(index + 1)];
  return newArray;
}

export function ordinalSuffixOf(i: number) {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return i + 'st';
  }
  if (j === 2 && k !== 12) {
    return i + 'nd';
  }
  if (j === 3 && k !== 13) {
    return i + 'rd';
  }
  return i + 'th';
}

export function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function capitalizeFirstLetterAndLowerRest(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export function convertToUnderscore(v: string) {
  return v
    .split(/(?=[A-Z][^A-Z_])/)
    .join('_')
    .split(/\s+(?=[^_])/)
    .join('_')
    .replace(/[^A-Za-z0-9_]/g, '')
    .toUpperCase();
}

export function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function underscoreToTitleCase(str: string) {
  return str
    .split('_')
    .map((word) => capitalizeFirstLetterAndLowerRest(word))
    .join(' ');
}

export function sequence(total: number) {
  const seq: number[] = [];

  for (let i = 0; i < total; i++) {
    seq.push(i);
  }

  return seq;
}

export function withDefault<T>(value: T | null | undefined, defaultValue: T) {
  return value == null ? defaultValue : value;
}

export function notEmpty<T>(value: T | null | undefined) {
  if (value == null) throw new Error(`Empty value ${value}`);
  return value;
}

export function pow2(x: number) {
  return x * x;
}

export function safeWhileTrue<T>(code: () => T | undefined | null, maxNumIterations = 1000000): T {
  let i = 0;
  while (true) {
    if (i > maxNumIterations) throw new Error('Infinite loop detected');
    const r = code();
    if (r != null) return r;
    i++;
  }
}

export function haveOverlap<T>(arr1: T[], arr2: T[]) {
  return arr1.some((element) => arr2.includes(element));
}

export function flatten<T>(arr: T[][]): T[] {
  return ([] as T[]).concat(...arr);
}

export function spliceSlice(str: string, _index: number, count: number, add?: string) {
  let index = _index;
  // We cannot pass negative indexes directly to the 2nd slicing operation.
  if (index < 0) {
    index = str.length + index;
    if (index < 0) {
      index = 0;
    }
  }

  return str.slice(0, index) + (add || '') + str.slice(index + count);
}
