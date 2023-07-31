import { type CalcEnv } from './CalcEnv';
import { type Mutable } from './Mutable';

export type FilterExpressionInitializer = { id: string };
export abstract class FilterExpression<T extends Mutable> {
  public id: string;

  constructor({ id }: FilterExpressionInitializer) {
    this.id = id;
  }

  abstract copy(copyParams?: FilterExpressionInitializer): FilterExpression<T>;

  named(id: string) {
    return this.copy({ id });
  }

  and(exp: FilterExpression<T>): FilterExpression<T> {
    if (this instanceof True) {
      return exp;
    }

    if (exp instanceof True) {
      return this;
    }

    return new AndExpression<T>({ exps: [this, exp] });
  }

  or(exp: FilterExpression<T>): FilterExpression<T> {
    if (this instanceof True) {
      return this;
    }

    if (exp instanceof True) {
      return exp;
    }

    return new OrExpression<T>({ exps: [this, exp] });
  }

  not(): FilterExpression<T> {
    if (this instanceof True) {
      return new False();
    }

    if (this instanceof False) {
      return new True();
    }

    return new NotExpression<T>({ exp: this });
  }
}

export type TrueInitializer<T extends Mutable> = Partial<FilterExpressionInitializer>;
export class True<T extends Mutable> extends FilterExpression<T> {
  constructor({ ...rest }: TrueInitializer<T> = {}) {
    super({ id: 'true', ...rest });
  }

  copy(copyParams: Partial<TrueInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new True({ ...rest, ...copyParams });
  }
}

export type FalseInitializer<T extends Mutable> = Partial<FilterExpressionInitializer>;
export class False<T extends Mutable> extends FilterExpression<T> {
  constructor({ ...rest }: FalseInitializer<T> = {}) {
    super({ id: 'false', ...rest });
  }

  copy(copyParams: Partial<FalseInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new False({ ...rest, ...copyParams });
  }
}

export type FuncFilterExpressionInitializer<T extends Mutable> = Partial<FilterExpressionInitializer> & {
  check: (env: CalcEnv<T>) => boolean;
};
export class FuncFilterExpression<T extends Mutable> extends FilterExpression<T> {
  readonly check: (env: CalcEnv<T>) => boolean;

  constructor({ check, ...rest }: FuncFilterExpressionInitializer<T>) {
    super({ id: `check()`, ...rest });
    this.check = check;
  }

  copy(copyParams: Partial<FuncFilterExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new FuncFilterExpression({ ...rest, ...copyParams });
  }
}

export type AndExpressionInitializer<T extends Mutable> = Partial<FilterExpressionInitializer> & { exps: FilterExpression<T>[] };
export class AndExpression<T extends Mutable> extends FilterExpression<T> {
  public readonly exps: FilterExpression<T>[];

  constructor({ exps, ...rest }: AndExpressionInitializer<T>) {
    super({ id: exps.map((e) => e.id).join(' & '), ...rest });
    this.exps = exps;
  }

  copy(copyParams: Partial<AndExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new AndExpression({ ...rest, ...copyParams });
  }
}

export type OrExpressionInitializer<T extends Mutable> = Partial<FilterExpressionInitializer> & {
  exps: FilterExpression<T>[];
};
export class OrExpression<T extends Mutable> extends FilterExpression<T> {
  public readonly exps: FilterExpression<T>[];

  constructor({ exps, ...rest }: OrExpressionInitializer<T>) {
    super({ id: exps.map((e) => e.id).join(' | '), ...rest });
    this.exps = exps;
  }

  copy(copyParams: Partial<OrExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new OrExpression({ ...rest, ...copyParams });
  }
}

export type NotExpressionInitializer<T extends Mutable> = Partial<FilterExpressionInitializer> & { exp: FilterExpression<T> };
export class NotExpression<T extends Mutable> extends FilterExpression<T> {
  public readonly exp: FilterExpression<T>;

  constructor({ exp, ...rest }: NotExpressionInitializer<T>) {
    super({ id: `!${exp.id}`, ...rest });
    this.exp = exp;
  }

  copy(copyParams: Partial<NotExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new NotExpression({ ...rest, ...copyParams });
  }
}
