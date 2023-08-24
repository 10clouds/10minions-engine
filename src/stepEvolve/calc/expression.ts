import { randomBytes } from 'crypto';

import { type Mutable } from './Mutable';
import { type FilterExpression } from './filterExpressions';
import { type CalcEnv } from './CalcEnv';

export type ExpressionInitializer = { id?: string };
export abstract class Expression<T extends Mutable> {
  public id: string;

  constructor({ id }: ExpressionInitializer) {
    this.id = id !== undefined ? id : `${this.constructor.name}-${randomBytes(6).toString('hex')}`;
  }

  abstract copy(copyParams?: ExpressionInitializer): Expression<T>;

  named(id: string) {
    return this.copy({ id });
  }

  mul(...vars: (Expression<T> | number)[]): MulExpression<T> {
    return new MulExpression<T>({
      vars: [this as unknown as Expression<T>, ...vars],
    });
  }

  plus(...vars: (Expression<T> | number)[]): PlusExpression<T> {
    return new PlusExpression<T>({
      vars: [this as unknown as Expression<T>, ...vars],
    });
  }

  minus(b: Expression<T> | number): MinusExpression<T> {
    return new MinusExpression<T>({ a: this as Expression<T>, b });
  }

  div(b: Expression<T> | number): DivExpression<T> {
    return new DivExpression<T>({ a: this as Expression<T>, b });
  }

  exp(exponent: Expression<T> | number): ExpExpression<T> {
    return new ExpExpression<T>({
      base: this as unknown as Expression<T>,
      exponent,
    });
  }

  clamp(params: ClampParams<T>): ClampExpression<T> {
    return new ClampExpression<T>({ v: this as Expression<T>, params });
  }

  clampCombo(params: ClampComboParams<T>): ClampComboExpression<T> {
    return new ClampComboExpression<T>({
      v: this as unknown as Expression<T>,
      params,
    });
  }

  per(num: number) {
    return {
      atLeast: (num2: number, exp: Expression<T>) =>
        new ClampComboExpression<T>({
          v: this,
          params: {
            mode: { type: 'EXACTLY', num },
            value2: exp,
            mode2: { type: 'AT_LEAST', num: num2 },
          },
        }),
      exactly: (num2: number, exp: Expression<T>) =>
        new ClampComboExpression<T>({
          v: this,
          params: {
            mode: { type: 'EXACTLY', num },
            value2: exp,
            mode2: { type: 'EXACTLY', num: num2 },
          },
        }),
    };
  }

  ifAtLeast(num: number) {
    return {
      atLeast: (num2: number, exp: Expression<T>) =>
        new ClampComboExpression<T>({
          v: this,
          params: {
            mode: { type: 'AT_LEAST', num },
            value2: exp,
            mode2: { type: 'AT_LEAST', num: num2 },
          },
        }),
      exactly: (num2: number, exp: Expression<T>) =>
        new ClampComboExpression<T>({
          v: this,
          params: {
            mode: { type: 'AT_LEAST', num },
            value2: exp,
            mode2: { type: 'EXACTLY', num: num2 },
          },
        }),
    };
  }
}

export type ConstExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  c: number;
};
export class ConstExpression<T extends Mutable> extends Expression<T> {
  public c: number;

  constructor({ c, ...rest }: ConstExpressionInitializer<T>) {
    super({ id: c.toString(), ...rest });

    this.c = c;
  }

  copy(copyParams: Partial<ConstExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new ConstExpression<T>({ ...rest, ...copyParams });
  }
}

export type DivExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  a: Expression<T> | number;
  b: Expression<T> | number;
};
export class DivExpression<T extends Mutable> extends Expression<T> {
  public a: Expression<T>;
  public b: Expression<T>;

  constructor({ a, b, ...rest }: DivExpressionInitializer<T>) {
    const mappedA = makeSureIsExp(a);
    const mappedB = makeSureIsExp(b);
    super({ id: `${mappedA.id} / ${mappedB.id}`, ...rest });
    this.a = mappedA;
    this.b = mappedB;
  }

  copy(copyParams: Partial<DivExpression<T>> = {}) {
    const { id, ...rest } = this;
    return new DivExpression<T>({ ...rest, ...copyParams });
  }
}

export type ExpExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  base: Expression<T> | number;
  exponent: Expression<T> | number;
};
export class ExpExpression<T extends Mutable> extends Expression<T> {
  public base: Expression<T>;
  public exponent: Expression<T>;

  constructor({ base, exponent, ...rest }: ExpExpressionInitializer<T>) {
    const mappedBase = makeSureIsExp(base);
    const mappedExp = makeSureIsExp(exponent);
    super({ id: `${mappedBase.id} ** ${mappedExp.id}`, ...rest });
    this.base = mappedBase;
    this.exponent = mappedExp;
  }

  copy(copyParams: Partial<ExpExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new ExpExpression<T>({ ...rest, ...copyParams });
  }
}

export type GetExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  getter: (env: CalcEnv<T>) => number;
};
export class GetExpression<T extends Mutable> extends Expression<T> {
  public getter: (env: CalcEnv<T>) => number;

  constructor({ getter, ...rest }: GetExpressionInitializer<T>) {
    super({ ...rest });
    this.getter = getter;
  }

  copy(copyParams: Partial<GetExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new GetExpression<T>({ ...rest, ...copyParams });
  }
}

export type PlusExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  vars: (Expression<T> | number)[];
};
export class PlusExpression<T extends Mutable> extends Expression<T> {
  public vars: Expression<T>[];

  constructor({ vars, ...rest }: PlusExpressionInitializer<T>) {
    const mappedVars = vars.map((v) => makeSureIsExp(v));
    super({ id: `${mappedVars.map((v) => v.id).join(' + ')}`, ...rest });
    this.vars = mappedVars;
  }

  copy(copyParams: Partial<PlusExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new PlusExpression<T>({ ...rest, ...copyParams });
  }
}

export type MinusExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  a: Expression<T> | number;
  b: Expression<T> | number;
};
export class MinusExpression<T extends Mutable> extends Expression<T> {
  public a: Expression<T>;
  public b: Expression<T>;

  constructor({ a, b, ...rest }: MinusExpressionInitializer<T>) {
    const mappedA = makeSureIsExp(a);
    const mappedB = makeSureIsExp(b);
    super({ id: `${mappedA.id} - ${mappedB.id}`, ...rest });
    this.a = mappedA;
    this.b = mappedB;
  }

  copy(copyParams: Partial<MinusExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new MinusExpression<T>({ ...rest, ...copyParams });
  }
}

export type MulExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  vars: (Expression<T> | number)[];
};
export class MulExpression<T extends Mutable> extends Expression<T> {
  public vars: Expression<T>[];

  constructor({ vars, ...rest }: MulExpressionInitializer<T>) {
    const mappedVars = vars.map((v) => makeSureIsExp(v));
    super({ id: `${mappedVars.map((v) => v.id).join(' * ')}`, ...rest });
    this.vars = mappedVars;
  }

  copy(copyParams: Partial<MulExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new MulExpression<T>({ ...rest, ...copyParams });
  }
}

export type MinExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  vars: (Expression<T> | number)[];
};
export class MinExpression<T extends Mutable> extends Expression<T> {
  public vars: Expression<T>[];

  constructor({ vars, ...rest }: MinExpressionInitializer<T>) {
    const mappedVars = vars.map((v) => makeSureIsExp(v));
    super({ id: `min(${mappedVars.map((v) => v.id).join(', ')})`, ...rest });
    this.vars = mappedVars;
  }

  copy(copyParams: Partial<MinExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new MinExpression<T>({ ...rest, ...copyParams });
  }
}

export type DefsExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  defs: { name: string; base: Expression<T>; fitness: Expression<T> }[];
};
export class DefsExpression<T extends Mutable> extends Expression<T> {
  public defs: { name: string; base: Expression<T>; fitness: Expression<T> }[];

  constructor({ defs, ...rest }: DefsExpressionInitializer<T>) {
    super({ ...rest });
    this.defs = defs;
  }

  copy(copyParams: Partial<DefsExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new DefsExpression<T>({ ...rest, ...copyParams });
  }
}

export type ToNumberExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  f: FilterExpression<T>;
};
export class ToNumberExpression<T extends Mutable> extends Expression<T> {
  public f: FilterExpression<T>;

  constructor({ f, ...rest }: ToNumberExpressionInitializer<T>) {
    super({ id: `${f.id}`, ...rest });
    this.f = f;
  }

  copy(copyParams: Partial<ToNumberExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new ToNumberExpression<T>({ ...rest, ...copyParams });
  }
}

export type ErrorEscalationFunction = (x: number) => number;

export type ComplexPenality = {
  penalty: number;
  scale: number;
  errorEscalationFunction: ErrorEscalationFunction;
};

export type ClampParams<T extends Mutable> = {
  target?: number | Expression<T>;
  deadZone?: number;
  min?: number | Expression<T>;
  max?: number | Expression<T>;
  minPenalty?: number | ComplexPenality;
  maxPenalty?: number | ComplexPenality;
  penalty?: number | ComplexPenality;
};
export type ClampExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  v: Expression<T>;
  params: ClampParams<T>;
};
export class ClampExpression<T extends Mutable> extends Expression<T> {
  public v: Expression<T>;
  public params: ClampParams<T>;

  constructor({ v, params, ...rest }: ClampExpressionInitializer<T>) {
    // ?INFO previous id, and why id was so complicated?
    // super({ id: `clamp[${JSON.stringify(params)}](${v.id})`, ...rest });
    super({ id: v.id, ...rest });
    this.v = v;
    this.params = params;
  }

  copy(copyParams: Partial<ClampExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new ClampExpression<T>({ ...rest, ...copyParams });
  }
}

export type ComboMode = { type: 'EXACTLY'; num: number } | { type: 'AT_LEAST'; num: number };

export type ClampComboParams<T extends Mutable> = {
  mode: ComboMode;
  value2: Expression<T> | number;
  mode2: ComboMode;
};
export type ClampComboExpressionInitializer<T extends Mutable> = ExpressionInitializer & {
  v: Expression<T>;
  params: ClampComboParams<T>;
};
export class ClampComboExpression<T extends Mutable> extends Expression<T> {
  public v: Expression<T>;
  public params: ClampComboParams<T>;

  constructor({ v, params, ...rest }: ClampComboExpressionInitializer<T>) {
    // ?INFO previous id, and why id was so complicated?
    // super({ id: `${v.id}[clampCombo]${JSON.stringify(params)})]`, ...rest });
    super({ id: v.id, ...rest });

    this.v = v;
    this.params = params;
  }

  copy(copyParams: Partial<ClampComboExpressionInitializer<T>> = {}) {
    const { id, ...rest } = this;
    return new ClampComboExpression<T>({ ...rest, ...copyParams });
  }
}

export function makeSureIsExp<T extends Mutable>(v: number | Expression<T>): Expression<T>;
export function makeSureIsExp<T extends Mutable>(v: number | Expression<T> | undefined | null): Expression<T> | undefined;
export function makeSureIsExp<T extends Mutable>(v: number | Expression<T> | undefined | null) {
  if (v === null || v === undefined) return undefined;
  return typeof v === 'number' ? new ConstExpression({ c: v }) : v;
}

/*
export function createCheck<C extends Mutable<C>>(id: string, collection: CollectionName<C["parentType"]>, check: (c:C) => boolean) {
    return new ArrayExpression<C>({collection, source: undefined}).filterExp(
        new Filter({ id: `[check(${id})]`, check })
    ).named(id)
}*/
