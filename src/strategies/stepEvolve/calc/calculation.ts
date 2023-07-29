import { shouldNeverGetHere } from "../../../utils/shouldNeverGetHere";
import { withDefault } from '../../utils/utils';
import { type CalcEnv } from './CalcEnv';
import {
  ClampComboExpression,
  ClampExpression,
  ConstExpression,
  DefsExpression,
  DivExpression,
  ExpExpression,
  GetExpression,
  makeSureIsExp,
  MinExpression,
  MinusExpression,
  MulExpression,
  PlusExpression,
  ToNumberExpression,
  type Expression
} from './expression';
import { type Mutable } from './Mutable';

export function exponentialErrorEscalationFunction(x: number) {
  return Math.pow(2, x) - 1;
}

export function polynominalErrorEscalationFunction(exponent: number) {
  return (x: number) => Math.pow(x, exponent);
}

export function quadricErrorEscalationFunction() {
  return (x: number) => x * x;
}

export function linearErrorEscalationFunction(x: number) {
  return x;
}

export const DEFAULT_PENALITY = 10;
export const NAN_PENALITY = DEFAULT_PENALITY * 100;

export function calculateClamp<T extends Mutable>(env: CalcEnv<T>, expression: ClampExpression<T>): number {
  const valueThis = expression.v;
  const params = expression.params;
  const target = params.target != null ? makeSureIsExp(params.target) : null;
  const deadZone = params.deadZone != null ? params.deadZone : 0;
  const min = makeSureIsExp<T>(params.min != null ? params.min : target != null ? target.minus(deadZone) : undefined);
  const max = makeSureIsExp<T>(params.max != null ? params.max : target != null ? target.plus(deadZone) : undefined);
  const penalty = params.penalty != null ? params.penalty : DEFAULT_PENALITY;
  let minPenalty = withDefault(params.minPenalty, penalty);
  let maxPenalty = withDefault(params.maxPenalty, penalty);

  const value = env.calculate(valueThis);

  const minValue = min != null ? env.calculate(min) : undefined;
  const maxValue = max != null ? env.calculate(max) : undefined;

  minPenalty =
    typeof minPenalty === 'number'
      ? {
          penalty: minPenalty,
          scale: 1,
          errorEscalationFunction: polynominalErrorEscalationFunction(1.2),
        }
      : minPenalty;
  maxPenalty =
    typeof maxPenalty === 'number'
      ? {
          penalty: maxPenalty,
          scale: 1,
          errorEscalationFunction: polynominalErrorEscalationFunction(1.2),
        }
      : maxPenalty;

  if (isNaN(value)) {
    return -NAN_PENALITY;
  }

  if (minValue != null && value < minValue) {
    if (minPenalty == null) throw new Error('Minimum penalties not specified');

    return minPenalty.errorEscalationFunction((minValue - value) / minPenalty.scale) * -minPenalty.penalty;
  }

  if (maxValue != null && value > maxValue) {
    if (maxPenalty == null) throw new Error('Maximum penalties not specified');

    return maxPenalty.errorEscalationFunction((value - maxValue) / maxPenalty.scale) * -maxPenalty.penalty;
  }

  return 0;
}

/**
 * @returns The number of cards that this combo is missing to be valid
 */
export function calculateClampCombo<T extends Mutable>(env: CalcEnv<T>, expression: ClampComboExpression<T>): number {
  const valueThis = expression.v;
  const params = expression.params;
  const mode = params.mode;
  const mode2 = params.mode2;
  const value2 = makeSureIsExp(params.value2);

  if (mode.type === 'EXACTLY') {
    if (mode2.type === 'AT_LEAST') {
      return env.calculate(value2) * mode.num >= env.calculate(valueThis) * mode2.num
        ? 0
        : Math.abs(env.calculate(valueThis) * mode2.num - env.calculate(value2) * mode.num);
    } else if (mode2.type === 'EXACTLY') {
      return Math.abs(env.calculate(valueThis) * mode2.num - env.calculate(value2) * mode.num);
    } else {
      shouldNeverGetHere(mode2);
    }
  } else if (mode.type === 'AT_LEAST') {
    if (mode2.type === 'AT_LEAST') {
      return env.calculate(valueThis) >= mode.num !== env.calculate(value2) >= mode2.num
        ? Math.min(Math.abs(env.calculate(valueThis) - mode.num) + 1, Math.abs(env.calculate(value2) - mode2.num) + 1)
        : 0; //MAYBE: More continious fitness
    } else if (mode2.type === 'EXACTLY') {
      return calculateClampCombo(
        env,
        new ClampComboExpression({
          id: expression.id + 'Reversed',
          v: value2,
          params: { value2: valueThis, mode: mode2, mode2: mode },
        }),
      );
    } else {
      shouldNeverGetHere(mode2);
    }
  } else {
    shouldNeverGetHere(mode);
  }
}

export function calculateWithoutCaching<T extends Mutable>(env: CalcEnv<T>, e: Expression<T>): number {
  switch (e.constructor) {
    case ConstExpression: {
      const constExpression = e as ConstExpression<T>;
      return constExpression.c;
    }
    case ExpExpression: {
      const expExpression = e as ExpExpression<T>;
      return env.calculate(expExpression.base) ** env.calculate(expExpression.exponent);
    }
    case DivExpression: {
      const divExpression = e as DivExpression<T>;
      const result = env.calculate(divExpression.a) / env.calculate(divExpression.b);

      if (result === Number.POSITIVE_INFINITY) return 100000000;
      if (result === Number.NEGATIVE_INFINITY) return -100000000;
      if (isNaN(result)) return 0;

      return result;
    }
    case GetExpression: {
      const getExpression = e as GetExpression<T>;
      return getExpression.getter(env);
    }
    case PlusExpression: {
      const plusExpression = e as PlusExpression<T>;
      return plusExpression.vars.reduce((acc, v) => acc + env.calculate(v), 0);
    }
    case MinusExpression: {
      const minusExpression = e as MinusExpression<T>;
      return env.calculate(minusExpression.a) - env.calculate(minusExpression.b);
    }
    case MulExpression: {
      const mulExpression = e as MulExpression<T>;
      return mulExpression.vars.reduce((acc, v) => acc * env.calculate(v), 1);
    }
    case MinExpression: {
      const minExpression = e as MinExpression<T>;
      return Math.min(...minExpression.vars.map((v) => env.calculate(v)));
    }
    case ClampExpression: {
      const clampExpression = e as ClampExpression<T>;
      return calculateClamp(env, clampExpression);
    }
    case ClampComboExpression: {
      const clampComboExpression = e as ClampComboExpression<T>;
      return calculateClampCombo(env, clampComboExpression);
    }
    case DefsExpression: {
      const defsExpression = e as DefsExpression<T>;
      return defsExpression.defs.reduce((acc, def) => acc + env.calculate(def.fitness), 0);
    }
    case ToNumberExpression: {
      const toNumberExpression = e as ToNumberExpression<T>;
      return env.calculateFilter(toNumberExpression.f) ? 1 : 0;
    }
    default: {
      if (calculationHandlers[e.constructor.name] != null) {
        return calculationHandlers[e.constructor.name](e, env);
      }
      throw new Error('Unknown expression: ' + e.constructor.name);
    }
  }
}

const calculationHandlers: {
  [key: string]: (e: any, env: CalcEnv<any>) => number;
} = {};

export function registerCalculationHandler<T extends Mutable, E extends Expression<T>>(cls: typeof Expression, handler: (e: E, env: CalcEnv<T>) => number) {
  if (calculationHandlers[cls.name] != null) throw new Error('Already registered handler for ' + cls.name);
  calculationHandlers[cls.name] = handler;
}
