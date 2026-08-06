/* eslint-disable sonarjs/no-identical-functions */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDataOptionGranularity } from '@/domains/visualizations/core/chart-data-options/utils';
import { TranslatableError } from '@/infra/translation/translatable-error';

import { StyledColumn } from '../../../../chart-data-options/types';
import { Axis } from '../../../translations/axis-section.js';
import {
  CONTINUOUS_INTERVAL_MS,
  getCalendarTickPositions,
  getDateFormatter,
  getInterval,
  getNextContinuousDate,
  getXAxisDatetimeSettings,
} from './date-utils.js';

// Mock dependencies
vi.mock('@/domains/visualizations/core/chart-data-options/utils', () => ({
  getDataOptionGranularity: vi.fn(),
}));

vi.mock('../../../translations/axis-section', async () => {
  const actual = await vi.importActual('../../../translations/axis-section');
  return {
    ...actual,
    getDefaultDateFormat: vi.fn(() => 'MM/dd/yyyy'),
  };
});

describe('date-utils', () => {
  describe('getInterval', () => {
    it('should return correct intervals for different granularities', () => {
      expect(getInterval('Years')).toBe(CONTINUOUS_INTERVAL_MS.years);
      expect(getInterval('Quarters')).toBe(CONTINUOUS_INTERVAL_MS.quarters);
      expect(getInterval('Months')).toBe(CONTINUOUS_INTERVAL_MS.months);
      expect(getInterval('Weeks')).toBe(604800000);
      expect(getInterval('Days')).toBe(86400000);
      expect(getInterval('Hours')).toBe(3600000);
      expect(getInterval('AggHours')).toBe(3600000);
      expect(getInterval('MinutesRoundTo30')).toBe(1800000);
      expect(getInterval('AggMinutesRoundTo30')).toBe(1800000);
      expect(getInterval('MinutesRoundTo15')).toBe(900000);
      expect(getInterval('AggMinutesRoundTo15')).toBe(900000);
      expect(getInterval('AggMinutesRoundTo1')).toBe(60000);
    });

    it('should return 0 and warn for unsupported levels', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getInterval('UnsupportedLevel');

      expect(result).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Unsupported level');

      consoleSpy.mockRestore();
    });
  });

  describe('getNextContinuousDate', () => {
    it('should advance a month start to the next month start', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 0, 1), 'Months')).toBe(Date.UTC(2023, 1, 1));
    });

    it('should roll over to January when advancing a month past December', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 11, 1), 'Months')).toBe(Date.UTC(2024, 0, 1));
    });

    it('should keep the day of month when advancing a mid-month date by a month', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 0, 15), 'Months')).toBe(Date.UTC(2023, 1, 15));
    });

    it('should keep the time of day when advancing by a month', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 0, 15, 8, 30), 'Months')).toBe(
        Date.UTC(2023, 1, 15, 8, 30),
      );
    });

    it('should clamp to the last day of the target month when advancing by a month', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 0, 31), 'Months')).toBe(Date.UTC(2023, 1, 28));
    });

    it('should clamp to the last day of a leap February when advancing by a month', () => {
      expect(getNextContinuousDate(Date.UTC(2024, 0, 31), 'Months')).toBe(Date.UTC(2024, 1, 29));
    });

    it('should clamp to the last day of the target month when advancing by a quarter', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 10, 30), 'Quarters')).toBe(Date.UTC(2024, 1, 29));
    });

    it('should clamp a leap day to February 28 when advancing by a year', () => {
      expect(getNextContinuousDate(Date.UTC(2024, 1, 29), 'Years')).toBe(Date.UTC(2025, 1, 28));
    });

    it('should advance a quarter start by three months', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 0, 1), 'Quarters')).toBe(Date.UTC(2023, 3, 1));
    });

    it('should keep the day of month when advancing a mid-quarter date by a quarter', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 0, 15), 'Quarters')).toBe(Date.UTC(2023, 3, 15));
    });

    it('should advance a year start to the next year start', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 0, 1), 'Years')).toBe(Date.UTC(2024, 0, 1));
    });

    it('should keep the month and day when advancing a mid-year date by a year', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 5, 15), 'Years')).toBe(Date.UTC(2024, 5, 15));
    });

    it('should advance by the fixed interval for fixed-length granularities', () => {
      expect(getNextContinuousDate(Date.UTC(2023, 0, 1), 'Days')).toBe(
        Date.UTC(2023, 0, 1) + 86400000,
      );
    });
  });

  describe('getCalendarTickPositions', () => {
    it('should return calendar month starts between min and max', () => {
      const ticks = getCalendarTickPositions(Date.UTC(2023, 0, 1), Date.UTC(2023, 11, 1), 'Months');
      expect(ticks).toEqual([
        Date.UTC(2023, 0, 1),
        Date.UTC(2023, 1, 1),
        Date.UTC(2023, 2, 1),
        Date.UTC(2023, 3, 1),
        Date.UTC(2023, 4, 1),
        Date.UTC(2023, 5, 1),
        Date.UTC(2023, 6, 1),
        Date.UTC(2023, 7, 1),
        Date.UTC(2023, 8, 1),
        Date.UTC(2023, 9, 1),
        Date.UTC(2023, 10, 1),
        Date.UTC(2023, 11, 1),
      ]);
    });

    it('should normalize unaligned bounds to the surrounding month starts', () => {
      const ticks = getCalendarTickPositions(
        Date.UTC(2023, 0, 15),
        Date.UTC(2023, 11, 20),
        'Months',
      );

      expect(ticks).toHaveLength(12);
      expect(ticks?.[0]).toBe(Date.UTC(2023, 0, 1));
      expect(ticks?.[ticks.length - 1]).toBe(Date.UTC(2023, 11, 1));
    });

    it('should normalize unaligned bounds to the surrounding quarter starts', () => {
      const ticks = getCalendarTickPositions(
        Date.UTC(2023, 1, 10),
        Date.UTC(2023, 10, 5),
        'Quarters',
      );

      expect(ticks).toEqual([
        Date.UTC(2023, 0, 1),
        Date.UTC(2023, 3, 1),
        Date.UTC(2023, 6, 1),
        Date.UTC(2023, 9, 1),
      ]);
    });

    it('should return undefined for day granularity', () => {
      expect(
        getCalendarTickPositions(Date.UTC(2023, 0, 1), Date.UTC(2023, 0, 10), 'Days'),
      ).toBeUndefined();
    });
  });

  describe('getDateFormatter', () => {
    const mockDateFormatter = vi.fn(
      (date: Date, format: string) => `${date.getFullYear()}-${format}`,
    );

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return a formatted date function when dateFormatter and format are provided', () => {
      const category: StyledColumn = {
        column: { name: 'Date', type: 'datetime' },
        dateFormat: 'yyyy-MM-dd',
      };

      // Mock getDataOptionGranularity to return a specific value
      vi.mocked(getDataOptionGranularity).mockReturnValue('Days');

      const formatter = getDateFormatter(category, mockDateFormatter);
      const result = formatter(1609459200000); // January 1, 2021

      expect(mockDateFormatter).toHaveBeenCalledWith(new Date(1609459200000), 'yyyy-MM-dd');
      expect(result).toBe('2021-yyyy-MM-dd');
    });

    it('should use default date format when no dateFormat is provided', () => {
      const category: StyledColumn = {
        column: { name: 'Date', type: 'datetime' },
      };

      // Mock getDataOptionGranularity to return a value so getDefaultDateFormat works properly
      vi.mocked(getDataOptionGranularity).mockReturnValue('Days');

      const formatter = getDateFormatter(category, mockDateFormatter);
      const result = formatter(1609459200000);

      expect(result).toBe('2021-MM/dd/yyyy');
    });

    it('should return timestamp as string when no dateFormatter is provided', () => {
      const category: StyledColumn = {
        column: { name: 'Date', type: 'datetime' },
        dateFormat: 'yyyy-MM-dd',
      };

      // Mock getDataOptionGranularity to return a specific value
      vi.mocked(getDataOptionGranularity).mockReturnValue('Days');

      const formatter = getDateFormatter(category);
      const result = formatter(1609459200000);

      expect(result).toBe('1609459200000');
    });

    it('should return timestamp as string when no format is available', () => {
      const category: StyledColumn = {
        column: { name: 'Date', type: 'datetime' },
      };

      // Mock getDataOptionGranularity to return a specific value
      vi.mocked(getDataOptionGranularity).mockReturnValue('Days');

      const formatter = getDateFormatter(category);
      const result = formatter(1609459200000);

      expect(result).toBe('1609459200000');
    });
  });

  describe('getXAxisDatetimeSettings', () => {
    const mockDateFormatter = vi.fn(
      (date: Date, format: string) => `${date.getFullYear()}-${format}`,
    );

    beforeEach(() => {
      vi.clearAllMocks();
    });

    const createMockAxis = (overrides?: Partial<Axis>): Axis => ({
      enabled: true,
      titleEnabled: true,
      title: 'Test Axis',
      labels: true,
      gridLine: true,
      ...overrides,
    });

    const createMockCategory = (overrides?: Partial<StyledColumn>): StyledColumn => ({
      column: { name: 'Date', type: 'datetime' },
      dateFormat: 'yyyy-MM-dd',
      ...overrides,
    });

    it('should create datetime axis settings', () => {
      const axis = createMockAxis();
      const category = createMockCategory();
      const values = [1609459200000, 1609545600000, 1609632000000]; // 3 consecutive days

      // Mock getDataOptionGranularity to return Days so it uses getInterval
      vi.mocked(getDataOptionGranularity).mockReturnValue('Days');

      const result = getXAxisDatetimeSettings(axis, category, values, mockDateFormatter);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'datetime',
        title: {
          enabled: true,
          text: 'Test Axis',
        },
        min: values[0],
        max: values[values.length - 1],
        isDate: true,
      });
    });

    it('should calculate minimum interval when values are provided', () => {
      const axis = createMockAxis();
      const category = createMockCategory();
      const values = [1609459200000, 1609462800000, 1609466400000]; // 1-hour intervals

      // Mock granularity to return undefined so it uses the calculated interval
      vi.mocked(getDataOptionGranularity).mockReturnValue(undefined as any);

      const result = getXAxisDatetimeSettings(axis, category, values);

      expect(result).toHaveLength(1);
      expect(result[0].tickInterval).toBe(3600000); // 1 hour
    });

    it('should adjust interval for approximately monthly data', () => {
      const axis = createMockAxis();
      const category = createMockCategory();
      // Use values that will result in an interval between 25-30 days
      const values = [1609459200000, 1611705600000]; // About 26 days apart

      // Mock granularity to return undefined so it uses the calculated interval
      vi.mocked(getDataOptionGranularity).mockReturnValue(undefined as any);

      const result = getXAxisDatetimeSettings(axis, category, values);

      // month-like gaps normalize to the nominal 28-day continuous-month interval
      expect(result[0].tickInterval).toBe(CONTINUOUS_INTERVAL_MS.months);
    });

    it('should throw TranslatableError when interval calculation fails', () => {
      const axis = createMockAxis();
      const category = createMockCategory();
      const values = [1609459200000, 1609459200000]; // Same values

      // Mock granularity to return undefined so it uses the calculated interval
      vi.mocked(getDataOptionGranularity).mockReturnValue(undefined as any);

      expect(() => {
        getXAxisDatetimeSettings(axis, category, values);
      }).toThrow(TranslatableError);
    });

    it('should handle disabled axis elements', () => {
      const axis = createMockAxis({
        enabled: false,
        titleEnabled: false,
        labels: false,
        gridLine: false,
      });
      const category = createMockCategory();
      const values = [1609459200000, 1609545600000];

      // Mock getDataOptionGranularity to return Days
      vi.mocked(getDataOptionGranularity).mockReturnValue('Days');

      const result = getXAxisDatetimeSettings(axis, category, values);

      expect(result[0]).toMatchObject({
        title: { enabled: false },
        gridLineWidth: 0,
        labels: { enabled: false },
      });
    });

    it('should include custom formatter when dateFormatter is provided', () => {
      const axis = createMockAxis();
      const category = createMockCategory();
      const values = [1609459200000, 1609545600000];

      // Mock getDataOptionGranularity to return Days
      vi.mocked(getDataOptionGranularity).mockReturnValue('Days');

      const result = getXAxisDatetimeSettings(axis, category, values, mockDateFormatter);

      expect(result[0]?.labels?.formatter).toBeDefined();
    });

    it('should include calendar tickPositions for monthly granularity', () => {
      const axis = createMockAxis();
      const category = createMockCategory();
      const values = [Date.UTC(2023, 0, 1), Date.UTC(2023, 2, 1), Date.UTC(2023, 11, 1)];

      vi.mocked(getDataOptionGranularity).mockReturnValue('Months');

      const result = getXAxisDatetimeSettings(axis, category, values);

      expect(result[0].tickPositions).toEqual([
        Date.UTC(2023, 0, 1),
        Date.UTC(2023, 1, 1),
        Date.UTC(2023, 2, 1),
        Date.UTC(2023, 3, 1),
        Date.UTC(2023, 4, 1),
        Date.UTC(2023, 5, 1),
        Date.UTC(2023, 6, 1),
        Date.UTC(2023, 7, 1),
        Date.UTC(2023, 8, 1),
        Date.UTC(2023, 9, 1),
        Date.UTC(2023, 10, 1),
        Date.UTC(2023, 11, 1),
      ]);
      expect(result[0].tickInterval).toBe(CONTINUOUS_INTERVAL_MS.months);
    });

    it('should handle single value array', () => {
      const axis = createMockAxis();
      const category = createMockCategory();
      const values = [1609459200000];

      // Mock getDataOptionGranularity to return Days
      vi.mocked(getDataOptionGranularity).mockReturnValue('Days');

      const result = getXAxisDatetimeSettings(axis, category, values);

      expect(result[0]).toMatchObject({
        min: values[0],
        max: values[0],
      });
    });
  });
});
