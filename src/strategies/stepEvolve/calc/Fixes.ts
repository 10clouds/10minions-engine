
import { weightedRandomIndex } from '../../utils/utils';
import { type CalcEnv } from './CalcEnv';
import { type Mutable } from './Mutable';
import { issueReporter } from './issueReporter';

export const NULL_FIX = () => undefined;
export const UNIMPLEMENTED_FIX = () => {
  throw new Error('Fix is not implemented');
};

export function applyOneOfFixes<T extends Mutable>(
  obj: CalcEnv<T>,
  ..._fixes: { fix: (obj: CalcEnv<T>) => CalcEnv<T>; weight: number }[] | ((obj: CalcEnv<T>) => CalcEnv<T>)[]
): CalcEnv<T> {
  let fixes = _fixes;
  if (fixes.length > 0 && typeof fixes[0] === 'function') {
    fixes = (fixes as ((obj: CalcEnv<T>) => CalcEnv<T>)[]).map((f) => {
      return { fix: f, weight: 1 };
    });
  }

  let currentFixes = fixes as {
    fix: (obj: CalcEnv<T>) => CalcEnv<T>;
    weight: number;
  }[];
  while (currentFixes.length > 0) {
    const fixIndex = weightedRandomIndex(currentFixes, 'weight');
    if (fixIndex == null) {
      issueReporter.reportIssue('Fixes table empty');
      return obj;
    }
    const fix = currentFixes[fixIndex].fix;
    const ret = fix(obj);
    if (ret !== obj) return ret;
    currentFixes = [...currentFixes.slice(0, fixIndex), ...currentFixes.slice(fixIndex + 1)];
  }

  return obj;
}

export function sequenceOfFixes<T extends Mutable>(obj: T, ...fixes: ((obj: T) => T | undefined)[]): T | undefined {
  let anyFixApplied = false;
  let currentObj = obj;

  for (const fix of fixes) {
    console.assert(currentObj != null);

    const afterFix = fix(obj);
    anyFixApplied = anyFixApplied || afterFix != null;
    currentObj = afterFix != null ? afterFix : currentObj;
  }

  return anyFixApplied ? currentObj : undefined;
}

export function repeatFix<T extends Mutable>({
  obj,
  fix,
  target,
  repeatProbability = 0.6,
}: {
  obj: CalcEnv<T>;
  target?: number;
  fix: (obj: CalcEnv<T>, target?: number) => CalcEnv<T>;
  repeatProbability: number;
}): CalcEnv<T> {
  let repetitions = 0;

  let currentObj = obj;
  do {
    const newObj = fix(currentObj, target);
    if (newObj === currentObj) break;
    currentObj = newObj;
    repetitions++;
  } while (Math.random() < repeatProbability);

  if (repetitions > 0) {
    return currentObj;
  } else {
    return obj;
  }
}
