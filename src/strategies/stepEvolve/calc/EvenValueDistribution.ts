import { sum } from "../../utils/utils";

export class EvenValueDistribution<T extends { id: string }> {
  desiredDistribution: { [key: string]: number } = {};
  currentDistribution: { [key: string]: number } = {};
  orginalObjects: { [key: string]: T } = {};

  constructor(public totalDecks: number, referenceDistribution: [T, number][]) {
    this.desiredDistribution = {};
    this.currentDistribution = {};
    this.orginalObjects = {};

    if (totalDecks <= 0) throw new Error(`totalDecks must be positive, got ${totalDecks}`);
    if (referenceDistribution.length === 0) throw new Error(`referenceDistribution must not be empty`);

    const sumValues = sum(referenceDistribution, ([k, v]) => v);

    for (const [obj, value] of referenceDistribution) {
      this.desiredDistribution[obj.id] = (totalDecks * value) / sumValues;
      this.currentDistribution[obj.id] = 0;
      this.orginalObjects[obj.id] = obj;
    }
  }

  reportItem(obj: T) {
    this.currentDistribution[obj.id] += 1;
  }

  getPending() {
    //First fill in all the floor, and then fill ceil, just for this to be more even.
    for (const mode of ['FLOOR', 'CEIL']) {
      const pending = [];

      for (const [id, currentNum] of Object.entries(this.currentDistribution)) {
        let desiredNum = this.desiredDistribution[id];
        if (mode === 'CEIL') desiredNum = Math.ceil(desiredNum);
        if (desiredNum >= currentNum + 1) {
          pending.push({
            item: this.orginalObjects[id],
            weight: desiredNum - currentNum,
          });
        }
      }

      if (pending.length !== 0) {
        return pending;
      }
    }

    throw new Error('Should never get here');
  }
}
