import { type Expression } from './expression';
import { type Mutable } from './Mutable';

export type Target = number | undefined;

/**
 * @returns changed object, undefined if no changes were made
 */
export type Fix<T extends Mutable> = (expression: Expression<T>, target: Target, obj: T) => T | undefined;

export function changeSoItMatchesFilter<T extends Mutable>(o: T, check: (o: T) => boolean): T | undefined {
  return o;
}

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

/*
export abstract class Fixer {
    abstract customFix(expression: Expression<any>, target: Target, obj: unknown): unknown | undefined;

    fix<T extends Mutable>(e: Expression<T>, target: Target, obj: T): T | undefined {

        let fixed = this.customFix(e as Expression<any>, target, obj);
        if (fixed != null) return fixed as T;

        switch (e.constructor) {
            case ConstExpression:
                return undefined;
            case GetExpression:
                issueReporter.reportIssue(`No fix for a get expression ${e.id}`);
                return undefined;
            case ExpExpression: {
                let expExpression = e as ExpExpression<T>;

                return applyOneOfFixes(obj,
                    (obj: T) => this.fix<T>(
                        expExpression.base,
                        target != null ? target ** 1/calculate(expExpression.base, obj) : undefined,
                        obj
                    ),
                    (obj: T) => this.fix<T>(
                        expExpression.exponent,
                        target != null ? Math.log(target) / Math.log(calculate(expExpression.base, obj)) : undefined,
                        obj
                    ),
                )
            }
            case DivExpression: {
                let divExpression = e as DivExpression<T>;
                return applyOneOfFixes(obj,
                    (obj: T) => this.fix<T>(
                        divExpression.a,
                        target != null ? calculate(divExpression.b, obj) * target : undefined,
                        obj
                    ),
                    (obj: T) => this.fix<T>(
                        divExpression.b,
                        target != null ? calculate(divExpression.a, obj) / target: undefined,
                        obj
                    )
                );
            }

            case PlusExpression: {
                let plusExpression = e as PlusExpression<T>;
                let resolveVars = (obj: T, vars: Expression<T>[]) => vars.map(v => calculate(v, obj)).reduce((a, value) => a + value, 1)

                return applyOneOfFixes(obj,
                    ...plusExpression.vars.map(
                        v => (obj: T) => this.fix<T>(
                            e,
                            target != null ? target - resolveVars(obj, plusExpression.vars.filter(otherValue => otherValue != v)) : undefined,
                            obj
                        )
                    )
                );
            }
            case MulExpression: {
                let mulExpression = e as MulExpression<T>;
                let resolveVars = (obj: T, vars: Expression<T>[]) => vars.map(v => calculate(v, obj)).reduce((a, value) => a * value, 1)

                return applyOneOfFixes(obj,
                    ...mulExpression.vars.map(
                        v => (obj: T) => this.fix<T>(
                            e,
                            target != null ? target / resolveVars(obj, mulExpression.vars.filter(otherValue => otherValue != v)) : undefined,
                            obj
                        )
                    )
                );
            }
            case MinExpression:
                let minExpression = e as MinExpression<T>;
                //MAYBE: If target > current min, then maybe fix both? or just lower? We don't have an usecase yet like that
                //TODO: This is sheeity
                return this.fix(
                    getRandomElement(minExpression.vars.map(v => v)),
                    target,
                    obj
                )
            case ClampExpression: {
                let clampExpression = e as ClampExpression<T>;
                let params = clampExpression.params;
                let targetParam = params.target != null ? makeSureIsExp(params.target) : null;
                let deadZone = params.deadZone != null ? params.deadZone : 0;
                let min = params.min != null ? makeSureIsExp(params.min) : (targetParam != null ? targetParam.plus(-deadZone) : undefined)
                let max = params.max != null ? makeSureIsExp(params.max) : (targetParam != null ? targetParam.plus(deadZone) : undefined)

                let originalValue = calculate(clampExpression.v, obj);

                if (isNaN(originalValue)) throw new Error(`NaN value`)
                if (target == null || target !== 0) throw new Error(`Non-Zero target value for clamp`)

                if (min != null && originalValue < calculate(min, obj)) {
                    return this.fix(
                        clampExpression.v,
                        calculate(min, obj),
                        obj
                    )
                }

                if (max != null && originalValue > calculate(max, obj)) {
                    return this.fix(
                        clampExpression.v,
                        calculate(max, obj),
                        obj
                    )
                }

                throw new Error(`Misconfigured clamp '${clampExpression.id}', fix running without a need.`)
            }

            case ClampComboExpression: {
                let clampComboExpression = e as ClampComboExpression<T>;
                let params = clampComboExpression.params;
                let mode = params.mode;
                let mode2 = params.mode2;
                let value2 = makeSureIsExp(params.value2)
                let penality = params.penality != null ? params.penality : 10;
                let minVal1 = mode == ComboMode.AT_LEAST_TWO ? 2 : 1;
                let minVal2 = mode2 == ComboMode.AT_LEAST_TWO ? 2 : 1;

                if (mode == ComboMode.PER_ONE) {
                    if (mode2 === ComboMode.AT_LEAST_ONE || mode2 === ComboMode.AT_LEAST_TWO) {
                        return applyOneOfFixes(obj,
                            (obj: T) => this.fix(clampComboExpression.v, calculate(clampComboExpression.v, obj) - 1, obj),
                            (obj: T) => this.fix(value2, calculate(clampComboExpression.v, obj) * minVal2, obj)
                        )
                    } else if (mode2 === ComboMode.PER_ONE) {
                        return applyOneOfFixes(obj,
                            (obj: T) => this.fix(clampComboExpression.v, calculate(value2, obj), obj),
                            (obj: T) => this.fix(value2, calculate(clampComboExpression.v, obj), obj)
                        )
                    } else {
                        shouldNeverGetHere(mode2);
                    }
                } else if (mode == ComboMode.AT_LEAST_ONE || mode == ComboMode.AT_LEAST_TWO) {
                    if (mode2 === ComboMode.AT_LEAST_ONE || mode2 === ComboMode.AT_LEAST_TWO) {

                        return applyOneOfFixes(obj,
                            (obj: T) => this.fix(clampComboExpression.v, minVal1, obj),
                            (obj: T) => this.fix(value2, minVal2, obj)
                        )
                    } else if (mode2 === ComboMode.PER_ONE) {
                        let reversed = value2.clampCombo({ value2: clampComboExpression.v, mode: mode2, mode2: mode, penality: penality });
                        return this.fix(reversed, target, obj);
                    } else {
                        shouldNeverGetHere(mode2);
                    }
                } else {
                    shouldNeverGetHere(mode);
                }
            }
            case CountExpression: {
                let countExpression = e as CountExpression<T, Mutable<any>>;
                let currentCount = calculate(countExpression, obj);

                return repeatFix({
                    obj,
                    repeatProbability: 0.9,
                    fix: (obj: T, target?: number) => {
                        let fixes: ((obj: T) => (T | undefined))[] = [];

                        if (target == null || target >= currentCount) {
                            fixes.push((obj: T) => pickChildAndFix<T, Mutable<any>>({
                                parent: obj,
                                collection: countExpression.v.collection,
                                collectionFilter: ((o) => calculateFilter(countExpression.v.filterExp, o)),
                                fix: (o) => changeSoItMatchesFilter(o, (o) => !calculateFilter(countExpression.v.filterExp, o))
                            }))
                        }

                        if (target == null || target <= currentCount) {
                            fixes.push((obj: T) => pickChildAndFix<T, Mutable<any>>({
                                parent: obj,
                                collection: countExpression.v.collection,
                                collectionFilter: (o) => !calculateFilter(countExpression.v.filterExp, o),
                                fix: (o) => changeSoItMatchesFilter(o, (o) => calculateFilter(countExpression.v.filterExp, o)),
                            }))
                        }

                        return applyOneOfFixes(obj, ...fixes)
                    }
                })
            }
            case AvgExpression: {
                let avgExpression = e as AvgExpression<T, Mutable<any>>;
                let weightFunc = (o: Mutable<any>) => target == null ? 1 : pow2(Math.abs(target - calculate(avgExpression.e, o)));

                return applyOneOfFixes(obj,
                    // Pick a random child and move it so it balances other deviations from average
                    (obj: T) => pickChildAndFix({
                        parent: obj,
                        collection: avgExpression.v.collection,
                        collectionWeights: weightFunc,
                        collectionFilter: (o) => calculateFilter(avgExpression.v.filterExp, obj),
                        fix: (o) => {
                            return this.fix(
                                avgExpression.e,
                                target == null ? undefined : target + (target - calculate(avgExpression.e, o)),
                                o,
                            )
                        }
                    }),
                    // Pick a random child and move it towards target
                    (obj: T) => pickChildAndFix({
                        parent: obj,
                        collection: avgExpression.v.collection,
                        collectionFilter: (obj) => calculateFilter(avgExpression.v.filterExp, obj),
                        collectionWeights: weightFunc,
                        fix: (o) => {
                            return this.fix(
                                avgExpression.e,
                                target,
                                o,
                            )
                        }
                    }),
                    // Pick a random child and try to change it so it's no longer in filter
                    (obj: T) => {
                        if (avgExpression.v.filterExp instanceof True) return undefined;

                        return pickChildAndFix({
                            parent: obj,
                            collection: avgExpression.v.collection,
                            collectionFilter: (obj) => calculateFilter(avgExpression.v.filterExp, obj),
                            collectionWeights: (o: Mutable<any>) => 1,
                            fix: (o) => {
                                //filter: negateFilter(thisVarArray.selectedItemsFilter!),
                                return this.fix(
                                    avgExpression.e,
                                    undefined,
                                    o,
                                )
                            }
                        })
                    },
                    // Pick a child outside of filter and change it to be in the filter and move it towards average
                    (obj: T) => pickChildAndFix({
                        parent: obj,
                        collection: avgExpression.v.collection,
                        collectionFilter: (obj) => !calculateFilter(avgExpression.v.filterExp, obj),
                        collectionWeights: weightFunc,
                        fix: (o) => {
                            return this.fix(
                                avgExpression.e, //filter thisVarArray.selectedItemsFilter,
                                target,
                                o,
                            )
                        }
                    }),
                )
            }
            case SumExpression: {
                let sumExpression = e as SumExpression<T, Mutable<any>>;

                let diff = (target: number, current: number) => {
                    if (target == null) throw new Error ("targetValue must be set")
                    if (current == null) throw new Error ("currentValue must be set")

                    return (target - current);
                }

                return applyOneOfFixes(obj,
                    // change it so target is met
                    (obj: T) => {
                        if (target == null) return undefined;

                        return pickChildAndFix<T, Mutable<any>>({
                            parent: obj,
                            collection: sumExpression.v.collection,
                            collectionFilter: (obj) => calculateFilter(sumExpression.v.filterExp, obj),
                            fix: (o) => {
                                return this.fix(
                                    sumExpression.e,
                                    calculate(sumExpression.e, o) + diff(target, calculate(sumExpression, obj)),
                                    o,
                                )
                            },
                        })
                    },

                    // remove from array
                    (obj: T) => pickChildAndFix<T, Mutable<any>>({
                        parent: obj,
                        collection: sumExpression.v.collection,
                        collectionFilter: (obj) => calculateFilter(sumExpression.v.filterExp, obj),
                        fix: (o) => changeSoItMatchesFilter(o, (o) => !calculateFilter(sumExpression.v.filterExp, obj)),
                    }),

                    // add to array
                    (obj: T) => {
                        if (target == null) return undefined;

                        return pickChildAndFix<T, Mutable<any>>({
                            parent: obj,
                            collection: sumExpression.v.collection,
                            collectionFilter: (obj) => !calculateFilter(sumExpression.v.filterExp, obj),
                            fix: (o) => changeSoItMatchesFilter(o, (o) => calculateFilter(sumExpression.v.filterExp, obj)),//target: diff(fc),
                        })
                    },
                )
            }
            case DefsExpression: {
                let defsExpression = e as DefsExpression<T>;

                return applyOneOfFixesWithWeight(obj, ...defsExpression.defs.map(({base, fitness}) => {
                    return {
                        weight: -calculate(fitness, obj),
                        fix: (obj: T) => {
                            let newObj = this.fix(fitness, 0, obj)
                            if (newObj == null) {
                                issueReporter.reportIssue(`Unable to fix with ${fitness.id}`)
                                //newObj = fitness.fix(fc)
                                return;
                            }
                            newObj.addToHistory(`Mutated with ${fitness.id}`)
                            return newObj
                        }
                    }
                }))
            }
            default:
                throw new Error("Unknown expression type: " + e.constructor.name);
        }
    }
}
*/
