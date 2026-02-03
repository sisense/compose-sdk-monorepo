/* eslint-disable sonarjs/no-identical-functions */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDataOptionGranularity } from '@/domains/visualizations/core/chart-data-options/utils';
import { TranslatableError } from '@/infra/translation/translatable-error';

import { StyledColumn } from '../../../../chart-data-options/types';
import { Axis } from '../../../translations/axis-section.js';
import { getDateFormatter, getInterval, getXAxisDatetimeSettings } from './date-utils.js';

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
      expect(getInterval('Years')).toBe(31536000000);
      expect(getInterval('Quarters')).toBe(7884000000);
      expect(getInterval('Months')).toBe(2592000000);
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
      // Use values that will result in an interval between 25-30 days (25*86400000 = 2160000000, 30*86400000 = 2592000000)
      const values = [1609459200000, 1611705600000]; // About 26 days apart

      // Mock granularity to return undefined so it uses the calculated interval
      vi.mocked(getDataOptionGranularity).mockReturnValue(undefined as any);

      const result = getXAxisDatetimeSettings(axis, category, values);

      // The logic should adjust intervals between 25-30 days to exactly 30 days
      expect(result[0].tickInterval).toBe(2592000000); // Adjusted to exactly 30 days
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
