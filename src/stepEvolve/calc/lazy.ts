export interface Lazy<T> {
  (): T;
  isLazy: boolean;
}

export const lazy = <T>(getter: () => T): Lazy<T> => {
  let evaluated = false;
  let _res: T;
  const res = <Lazy<T>>function (): T {
    if (evaluated) return _res;
    _res = getter();
    evaluated = true;
    return _res;
  };
  res.isLazy = true;
  return res;
};
