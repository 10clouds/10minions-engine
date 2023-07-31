import { KeyOfType } from '../typescript/KeyOfType';

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
