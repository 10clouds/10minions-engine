export const computed = 'computed';

function getOwnPropertyDescriptorThroughInheritance(prototype: any, name: string): PropertyDescriptor {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);

  if (descriptor) {
    return descriptor;
  } else {
    return getOwnPropertyDescriptorThroughInheritance(Object.getPrototypeOf(prototype), name);
  }
}

/**
 * Basis for mutation algorithms to work with
 */
export interface Mutable {
  id: string;

  addToHistory(log: string): void;
  copy(): Mutable;
  assertEditing(): void;
  assertSealed(): void;
  seal(): void;
  hitCache<R>(key: string, calculate: () => R): R;
}

export abstract class BaseMutable implements Mutable {
  private __calc: { [key: string]: any } = {};
  private __varCache: { [key: string]: any } = {};

  id: string;

  abstract addToHistory(log: string): void;

  abstract copy(): Mutable;

  hitCache<R>(key: string, calculate: () => R): R {
    let result = this.__varCache[key];

    if (result == null) {
      result = calculate();
      this.__varCache[key] = result;
    }

    return result;
  }

  private editing = false;

  assertEditing() {
    if (!this.editing) {
      throw new Error('Not in edit mode');
    }
  }

  assertSealed() {
    if (this.editing) {
      throw new Error('Not sealed');
    }
  }

  seal() {
    this.editing = false;

    //TODO: Any of those should not basically be filled with anything at this stage ... would be good to verify that
    this.__calc = {};
    this.__varCache = {};
  }

  constructor(id: string, annotations: { [key in keyof BaseMutable]?: any } = {}) {
    this.editing = true;

    //this.__varCache = copyFrom == null ? this.__varCache : {...this.__varCache, ...copyFrom.__varCache};

    for (const [name, info] of Object.entries(annotations)) {
      const originalGet = getOwnPropertyDescriptorThroughInheritance(Object.getPrototypeOf(this), name).get;

      if (originalGet == null) {
        throw new Error(`No get found in ${name}`);
      }

      Object.defineProperty(this, name, {
        get() {
          if (this.__calc[name] == null) {
            this.__calc[name] = originalGet.apply(this);
          }

          return this.__calc[name];
        },
      });
    }

    this.id = id;
  }
}
