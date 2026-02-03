export type Stat =
  | 'sum'
  | 'max'
  | 'min'
  | 'count'
  | 'countdistinct'
  | 'average'
  | 'mean'
  | 'avg'
  | 'variance'
  | 'var'
  | 'stddev';

export class Distribution {
  data: number[];

  sum: number | undefined;

  max: number | undefined;

  min: number | undefined;

  avg: number | undefined;

  variance: number | undefined;

  stddev: number | undefined;

  constructor(data: number[]) {
    this.data = data;
  }

  getStat(stat: string): number {
    switch (stat) {
      case 'sum': {
        return this.getSum();
      }
      case 'max': {
        return this.getMax();
      }
      case 'min': {
        return this.getMin();
      }
      case 'count': {
        return this.getCount();
      }
      case 'countdistinct': {
        return this.getCountDistinct();
      }
      case 'avg':
      case 'mean':
      case 'average': {
        return this.getAverage();
      }
      case 'var':
      case 'variance': {
        return this.getVariance();
      }
      case 'stddev': {
        return this.getStdDev();
      }
    }
    return NaN;
  }

  getSum() {
    if (this.data.length === 0) {
      return NaN;
    }
    if (this.sum != undefined) {
      return this.sum;
    }
    this.sum = 0;
    for (const value of this.data) {
      this.sum += value;
    }
    return this.sum;
  }

  getMax() {
    if (this.data.length === 0) {
      return NaN;
    }
    if (this.max) {
      return this.max;
    }
    if (this.data.length <= 0) {
      return NaN;
    }
    this.max = this.data[0];
    for (const value of this.data) {
      if (value > this.max) {
        this.max = value;
      }
    }
    return this.max;
  }

  getMin() {
    if (this.data.length === 0) {
      return NaN;
    }
    if (this.min) {
      return this.min;
    }
    if (this.data.length <= 0) {
      return NaN;
    }
    this.min = this.data[0];
    for (const value of this.data) {
      if (value < this.min) {
        this.min = value;
      }
    }
    return this.min;
  }

  getMean() {
    return this.getAverage();
  }

  getAverage() {
    if (this.data.length === 0) {
      return NaN;
    }
    if (this.avg) {
      return this.avg;
    }
    this.avg = this.getSum() / this.data.length;
    return this.avg;
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

  getVariance() {
    // sample variance
    if (this.variance === undefined) {
      if (this.data.length === 0) {
        this.variance = NaN;
      } else if (this.data.length === 1) {
        this.variance = 0;
      } else {
        const mean = this.getMean();
        this.variance =
          this.data
            .reduce((acc: number[], val: number) => acc.concat((val - mean) ** 2), [])
            .reduce((acc, val) => acc + val, 0) /
          (this.data.length - 1);
      }
    }
    return this.variance;
  }

  getStdDev() {
    if (this.data.length === 0) {
      return NaN;
    }
    if (this.stddev != undefined) {
      return this.stddev;
    }
    this.stddev = Math.sqrt(this.getVariance());

    return this.stddev;
  }
}
