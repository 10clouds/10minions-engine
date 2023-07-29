
export class MultiSet {
  private _backing: { [key: string]: number; } = {};
  private _array: string[] = [];

  constructor(values: string[]) {
    this.add(...values);
  }

  add(...values: string[]) {
    for (const value of values) {
      if (this._backing[value] > 0) {
        this._backing[value] = 1 + this._backing[value];
      } else {
        this._backing[value] = 1;
      }
      this._array.push(value);
    }
  }

  delete(value: string) {
    if (this.get(value) > 0) {
      this._backing[value] = this.get(value) - 1;

      const idx = this._array.indexOf(value);
      if (idx === -1) throw new Error('Internal error');
      this._array.splice(idx, 1);
    }
  }

  entries() {
    return Object.entries(this._backing);
  }

  expand() {
    return this._array;
  }

  get(value: string): number {
    const v = this._backing[value];
    if (v != null && v > 0) {
      return v;
    } else {
      return 0;
    }
  }
}
