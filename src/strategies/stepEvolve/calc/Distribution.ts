import {
  sum,
  weightedRandomElement,
  weightedRandomElements,
  uniqueWeightedRandomElements,
  getRandomElement,
  getRandomSubarray,
  withDefault,
} from '../../utils/utils';

export type DistributionValue = number | string;

export interface Distribution {
  at(value: DistributionValue): number;
  get domain(): string[];

  readonly counts: { count: number; weight: number }[];

  randomElement(): string;
  randomElements(count?: number): string[];
}

export class ValuesDistribution<T extends string> {
  readonly mapping: { [key: DistributionValue]: number };
  readonly entries: { value: T; weight: number }[];
  readonly counts: { count: number; weight: number }[];
  readonly allowDuplicates: boolean;

  normalize() {
    const total = sum(this.entries, (e) => e.weight);
    return new ValuesDistribution({
      values: this.entries.map(({ value, weight }) => {
        return { value, weight: weight / total };
      }),
      domain: this.domain,
      counts: this.counts,
      allowDuplicates: this.allowDuplicates,
    });
  }

  humanReadable() {
    const r = [];
    const total = sum(this.entries, (e) => e.weight);
    const entries = this.entries.slice();
    entries.sort((e1, e2) => e2.weight - e1.weight);
    for (const { value, weight } of entries) {
      r.push(`${((weight / total) * 100).toFixed(1)}% ${value}`);
    }
    return r;
  }

  at(value: DistributionValue) {
    return this.mapping[value];
  }

  randomElement() {
    return weightedRandomElement(this.entries, 'weight')!.value;
  }

  randomElements(_count?: number) {
    let count = _count;
    if (count == null) {
      count = weightedRandomElement(this.counts, 'weight')?.count;
      if (count == null || count < 0 || !Number.isInteger(count))
        throw new Error('Invalid number of elements: ' + count);
    }
    if (this.allowDuplicates) {
      return weightedRandomElements(this.entries, 'weight', count).map(
        (e) => e.value,
      );
    } else {
      return uniqueWeightedRandomElements(this.entries, 'weight', count).map(
        (e) => e.value,
      );
    }
  }

  filter(predicate: (value: DistributionValue) => boolean) {
    return new ValuesDistribution<T>({
      values: this.entries.filter((e) => predicate(e.value)),
      domain: this.domain,
      counts: this.counts,
      allowDuplicates: this.allowDuplicates,
    });
  }

  get domain() {
    return Object.keys(this.mapping);
  }

  constructor({
    values,
    domain,
    counts = [{ count: 1, weight: 1 }],
    allowDuplicates = true,
  }: {
    values: (
      | DistributionValue
      | { value: DistributionValue; weight: number }
    )[];
    domain?: DistributionValue[];
    counts?: { count: number; weight: number }[];
    allowDuplicates?: boolean;
  }) {
    this.mapping = {};

    if (domain != null) {
      domain.forEach((v) => (this.mapping[v] = 0));
    }

    values.forEach((v) => {
      const value = (
        typeof v === 'number' || typeof v === 'string' ? v : v.value
      ).toString();
      const weight =
        typeof v === 'number' || typeof v === 'string' ? 1 : v.weight;

      if (this.mapping[value] == null) {
        if (domain != null) {
          throw new Error(`Value ${value} not found in ${domain}`);
        }

        this.mapping[value] = weight;
      } else {
        this.mapping[value] += weight;
      }
    });

    this.entries = Object.entries(this.mapping).map(([k, v]) => {
      return { value: k as T, weight: v };
    });
    this.counts = counts;
    this.allowDuplicates = allowDuplicates;
  }
}

export class FunctionDistribution implements Distribution {
  readonly counts: { count: number; weight: number }[] = [
    { count: 1, weight: 1 },
  ];

  at(value: string): number {
    return this.fun(value);
  }

  randomElement(): string {
    return getRandomElement(this.domain);
  }

  randomElements(count = 1): string[] {
    return getRandomSubarray(this.domain, count);
  }

  constructor(
    public fun: (value: DistributionValue) => number,
    public domain: string[] = [],
  ) {}
}

export class UniformDistribution implements Distribution {
  readonly counts: { count: number; weight: number }[] = [
    { count: 1, weight: 1 },
  ];

  at(value: string): number {
    return 1 / this.domain.length;
  }

  randomElement(): string {
    return getRandomElement(this.domain);
  }

  randomElements(count = 1): string[] {
    return getRandomSubarray(this.domain, count);
  }

  constructor(public domain: string[] = []) {}
}

export function residualError(
  value: string,
  distribution: Distribution,
  referenceDistribution: Distribution,
  deadZone = 0,
) {
  const error =
    withDefault(referenceDistribution.at(value), 0) -
    withDefault(distribution.at(value), 0);
  if (Math.abs(error) > deadZone) {
    return error;
  } else {
    return 0;
  }
}

export function residualSquare(
  value: string,
  distribution: Distribution,
  referenceDistribution: Distribution,
  deadZone = 0,
) {
  const re = residualError(
    value,
    distribution,
    referenceDistribution,
    deadZone,
  );
  return re * re;
}

export function residualSumOfSquares(
  distribution: Distribution,
  distributionWithDomain: Distribution,
  deadZone = 0,
  _domain: string[] = [],
) {
  let domain = _domain;
  if (distributionWithDomain?.domain != null) {
    domain = distributionWithDomain.domain;
  }
  return sum(domain, (k) =>
    residualSquare(k, distribution, distributionWithDomain, deadZone),
  );
}
