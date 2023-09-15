import { CategoricalDistribution } from './categorical-distribution';

const data = ['Jan', 'Feb', 'Mar', 'Mar', 'Dec'];

describe('Distribution', () => {
  describe("when data is ['Jan', 'Feb', 'Mar', 'Mar', 'Dec'] return value of", () => {
    it('Count', () => {
      const value = new CategoricalDistribution(data).getStat('count');
      expect(value).toBe(5);
    });
    it('Count Distinct', () => {
      const dist = new CategoricalDistribution(data);
      expect(dist.getCountDistinct()).toBe(4);
    });
    describe('NaN for any invalid categorical aggregation functions', () => {
      it('Avg', () => {
        const value = new CategoricalDistribution(data).getStat('avg');
        expect(value).toBeNaN();
      });
    });
  });
  describe('when data is [] returns 0', () => {
    it('Count', () => {
      const value = new CategoricalDistribution([]).getStat('count');
      expect(value).toBe(0);
    });
    it('Count Distinct', () => {
      const value = new CategoricalDistribution([]).getStat('countdistinct');
      expect(value).toBe(0);
    });
  });
});
