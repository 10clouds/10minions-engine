import { calculateWithoutCaching } from './calculation';
import { type Expression } from './expression';
import { calculateFilterWithoutCaching } from './filterCalculations';
import { type FilterExpression } from './filterExpressions';
import { type Mutable } from './Mutable';

export abstract class CalcEnv<T extends Mutable> {
  readonly obj: T;

  constructor(obj: T) {
    this.obj = obj;
  }

  abstract copy(obj?: T): CalcEnv<T>;

  edit(makeChanges: (obj: T) => void): CalcEnv<T> {
    const newObj = this.obj.copy() as T;
    makeChanges(newObj);
    newObj.seal();
    const newEnv = this.copy(newObj);
    return newEnv;
  }

  calculate<T extends Mutable>(expression: Expression<T>): number {
    return this.obj.hitCache(expression.id, () => calculateWithoutCaching(this, expression));
  }

  calculateFilter<T extends Mutable>(e: FilterExpression<T>): boolean {
    return this.obj.hitCache('fexp:' + e.id, () => calculateFilterWithoutCaching(this, e));
  }
}

export class NodeCalcEnv<T extends Mutable> extends CalcEnv<T> {
  constructor(obj: T) {
    super(obj);
  }

  copy(obj?: T): CalcEnv<T> {
    return new NodeCalcEnv(obj != null ? obj : this.obj);
  }
}

export class RootCalcEnv<T extends Mutable> extends CalcEnv<T> {
  public iteration = 0;

  constructor(obj: T, iteration = 0, history: string[] = []) {
    super(obj);
    this.iteration = iteration;
  }

  copy(obj?: T): CalcEnv<T> {
    return new RootCalcEnv<T>(obj != null ? obj : this.obj, this.iteration);
  }
}
