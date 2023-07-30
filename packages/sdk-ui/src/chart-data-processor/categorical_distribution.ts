export type CategoricalStat = 'count' | 'countdistinct';

export class CategoricalDistribution {
  data: string[];

  countDistinct: number | undefined;

  constructor(data: string[]) {
    this.data = data;
  }

  getStat(stat: string): number {
    switch (stat) {
      case 'count': {
        return this.getCount();
      }
      case 'countdistinct': {
        return this.getCountDistinct();
      }
    }
    return NaN;
  }

  getN() {
    return this.getCount();
  }

  getCount() {
    return this.data.length;
  }

  getCountDistinct() {
    return this.data.filter((value, index, self) => self.indexOf(value) === index).length;
  }
}
