import dayjs from 'dayjs';

import { calculateNewDateRange } from './date-range-calculator.js';

const MAR_05 = dayjs('2024-03-05');
const MAR_10 = dayjs('2024-03-10');
const MAR_20 = dayjs('2024-03-20');
const MAR_25 = dayjs('2024-03-25');

describe('calculateNewDateRange', () => {
  describe('when the opposite end is absent', () => {
    it('should fill only "from" when picking in "fromSelector" mode', () => {
      const result = calculateNewDateRange({}, MAR_05, 'fromSelector');

      expect(result.from).toBe(MAR_05);
      expect(result.to).toBeUndefined();
    });

    it('should fill only "to" when picking in "toSelector" mode', () => {
      const result = calculateNewDateRange({}, MAR_20, 'toSelector');

      expect(result.from).toBeUndefined();
      expect(result.to).toBe(MAR_20);
    });

    it('should keep "to" absent when re-picking "from"', () => {
      const result = calculateNewDateRange({ from: MAR_05 }, MAR_20, 'fromSelector');

      expect(result.from).toBe(MAR_20);
      expect(result.to).toBeUndefined();
    });

    it('should keep "from" absent when re-picking "to"', () => {
      const result = calculateNewDateRange({ to: MAR_20 }, MAR_25, 'toSelector');

      expect(result.from).toBeUndefined();
      expect(result.to).toBe(MAR_25);
    });

    it('should complete the range when picking the missing "to"', () => {
      const result = calculateNewDateRange({ from: MAR_05 }, MAR_20, 'toSelector');

      expect(result.from).toBe(MAR_05);
      expect(result.to).toBe(MAR_20);
    });
  });

  describe('when only the opposite end is present', () => {
    it('should clamp "to" down when "from" is picked after it', () => {
      const result = calculateNewDateRange({ to: MAR_20 }, MAR_25, 'fromSelector');

      expect(result.from).toBe(MAR_25);
      expect(result.to).toBe(MAR_25);
    });

    it('should preserve "to" when "from" is picked before it', () => {
      const result = calculateNewDateRange({ to: MAR_20 }, MAR_05, 'fromSelector');

      expect(result.from).toBe(MAR_05);
      expect(result.to).toBe(MAR_20);
    });

    it('should clamp "from" up when "to" is picked before it', () => {
      const result = calculateNewDateRange({ from: MAR_10 }, MAR_05, 'toSelector');

      expect(result.from).toBe(MAR_05);
      expect(result.to).toBe(MAR_05);
    });
  });

  describe('when both ends are present', () => {
    it('should collapse the range when "from" is picked after "to"', () => {
      const result = calculateNewDateRange({ from: MAR_05, to: MAR_20 }, MAR_25, 'fromSelector');

      expect(result.from).toBe(MAR_25);
      expect(result.to).toBe(MAR_25);
    });

    it('should collapse the range when "to" is picked before "from"', () => {
      const result = calculateNewDateRange({ from: MAR_10, to: MAR_20 }, MAR_05, 'toSelector');

      expect(result.from).toBe(MAR_05);
      expect(result.to).toBe(MAR_05);
    });

    it('should move only "from" when it stays before "to"', () => {
      const result = calculateNewDateRange({ from: MAR_05, to: MAR_20 }, MAR_10, 'fromSelector');

      expect(result.from).toBe(MAR_10);
      expect(result.to).toBe(MAR_20);
    });

    it('should move only "to" when it stays after "from"', () => {
      const result = calculateNewDateRange({ from: MAR_05, to: MAR_20 }, MAR_25, 'toSelector');

      expect(result.from).toBe(MAR_05);
      expect(result.to).toBe(MAR_25);
    });
  });
});
