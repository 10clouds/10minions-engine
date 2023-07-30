import { type CalcEnv } from './CalcEnv';
import { AndExpression, False, type FilterExpression, FuncFilterExpression, NotExpression, OrExpression, True } from './filterExpressions';
import { type Mutable } from './Mutable';

export function calculateFilterWithoutCaching<T extends Mutable>(env: CalcEnv<T>, e: FilterExpression<T>): boolean {
  switch (e.constructor) {
    case AndExpression:
      return (e as AndExpression<T>).exps.every((f) => env.calculateFilter(f));
    case OrExpression:
      return (e as OrExpression<T>).exps.some((f) => env.calculateFilter(f));
    case NotExpression:
      return !env.calculateFilter((e as NotExpression<T>).exp);
    case FuncFilterExpression:
      return (e as FuncFilterExpression<T>).check(env);
    case False:
      return false;
    case True:
      return true;
    default:
      throw new Error(`Unknown filter type: ${e.constructor.name}`);
  }
}
