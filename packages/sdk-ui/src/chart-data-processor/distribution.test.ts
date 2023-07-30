import { Distribution } from './distribution';

describe('Distribution', () => {
  describe('when data is [3, 4, 2, 1, 0] return value of', () => {
    const data = [3, 4, 2, 1, 0];
    it('Sum', () => {
      const value = new Distribution(data).getStat('sum');
      expect(value).toBe(10);
    });
    it('Min', () => {
      const value = new Distribution(data).getStat('min');
      expect(value).toBe(0);
    });
    it('Max', () => {
      const value = new Distribution(data).getStat('max');
      expect(value).toBe(4);
    });
    it('Average', () => {
      const value = new Distribution(data).getStat('average');
      expect(value).toBe(2);
    });
    it('Count', () => {
      const value = new Distribution(data).getStat('count');
      expect(value).toBe(5);
    });
    it('Variance', () => {
      const value = new Distribution(data).getStat('variance');
      expect(value).toBeCloseTo(2.5, 3);
    });
    it('StdDev', () => {
      const value = new Distribution(data).getStat('stddev');
      expect(value).toBeCloseTo(1.581, 3);
    });
  });
  describe('when data is [3, 4, 2, 2, 1, 1, 0, 0] return value of', () => {
    const data = [3, 4, 2, 2, 1, 1, 0, 0];
    it('Count Distinct', () => {
      const dist = new Distribution(data);
      expect(dist.getCount()).toBe(8);
      expect(dist.getCountDistinct()).toBe(5);
    });
  });
  describe('when data is [] returns NaN', () => {
    it('Sum', () => {
      const value = new Distribution([]).getStat('sum');
      expect(isNaN(value)).toBeTruthy();
    });
    it('Min', () => {
      const value = new Distribution([]).getStat('min');
      expect(isNaN(value)).toBeTruthy();
    });
    it('Max', () => {
      const value = new Distribution([]).getStat('max');
      expect(isNaN(value)).toBeTruthy();
    });
    it('Average', () => {
      const value = new Distribution([]).getStat('average');
      expect(isNaN(value)).toBeTruthy();
    });
    it('Count', () => {
      const value = new Distribution([]).getStat('count');
      expect(value).toBe(0);
    });
  });
});
