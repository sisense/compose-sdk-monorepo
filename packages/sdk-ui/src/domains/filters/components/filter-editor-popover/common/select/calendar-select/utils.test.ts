import { DateLevels } from '@sisense/sdk-data';
import dayjs from 'dayjs';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { formatDateValue } from '@/domains/query-execution/core/date-formats';
import { getDefaultDateMask } from '@/domains/query-execution/core/date-formats/apply-date-format';
import { formatDatetimeString } from '@/domains/visualizations/components/pivot-table/formatters/header-cell-formatters/header-cell-value-formatter';

import { DatetimeFormatter } from '../../../hooks/use-datetime-formatter';
import {
  getCalendarSelectedItemsDisplayValue,
  toLocalCalendarDate,
  toUtcCalendarDate,
} from './utils';

/**
 * Mirrors the composition in `useDatetimeFormatter` so the display assertions exercise the real
 * formatting engine, which renders in UTC, rather than a stand-in.
 */
const formatter: DatetimeFormatter = (value, format) =>
  formatDatetimeString(value, (date, dateFormat) => formatDateValue(date, dateFormat), format);

const ORIGINAL_TZ = process.env.TZ;

/**
 * Zones on both sides of UTC. A date bug that shifts the day is invisible in UTC, so the offset
 * sign is what each case is really varying.
 */
const TIME_ZONES = [
  { name: 'UTC', tz: 'UTC' },
  { name: 'ahead of UTC (Europe/Kiev)', tz: 'Europe/Kiev' },
  { name: 'far ahead of UTC (Asia/Tokyo)', tz: 'Asia/Tokyo' },
  { name: 'behind UTC (America/New_York)', tz: 'America/New_York' },
  { name: 'far behind UTC (Pacific/Honolulu)', tz: 'Pacific/Honolulu' },
];

afterAll(() => {
  process.env.TZ = ORIGINAL_TZ;
});

describe.each(TIME_ZONES)('calendar-select utils in $name', ({ tz }) => {
  beforeEach(() => {
    process.env.TZ = tz;
  });

  describe('toUtcCalendarDate', () => {
    it('anchors a locally picked day to UTC midnight of the same day', () => {
      // What react-datepicker hands back when the user clicks December 2nd.
      const picked = dayjs(new Date(2013, 11, 2));

      expect(toUtcCalendarDate(picked).toISOString()).toBe('2013-12-02T00:00:00.000Z');
    });

    it('keeps the day number when the picked day starts a month', () => {
      const picked = dayjs(new Date(2024, 0, 1));

      expect(toUtcCalendarDate(picked).toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('keeps the day number across a leap day', () => {
      const picked = dayjs(new Date(2024, 1, 29));

      expect(toUtcCalendarDate(picked).toISOString()).toBe('2024-02-29T00:00:00.000Z');
    });
  });

  describe('toLocalCalendarDate', () => {
    it('renders a UTC-midnight value as the same day in the calendar', () => {
      const stored = new Date('2013-12-02T00:00:00.000Z');
      const local = toLocalCalendarDate(stored);

      expect([local.year(), local.month(), local.date()]).toEqual([2013, 11, 2]);
      expect([local.hour(), local.minute()]).toEqual([0, 0]);
    });

    it('is the inverse of toUtcCalendarDate', () => {
      const stored = new Date('2013-12-02T00:00:00.000Z');

      expect(toUtcCalendarDate(toLocalCalendarDate(stored)).toISOString()).toBe(
        stored.toISOString(),
      );
    });
  });

  describe('getCalendarSelectedItemsDisplayValue', () => {
    it('displays the day the user picked', () => {
      const picked = toUtcCalendarDate(dayjs(new Date(2013, 11, 2)));

      expect(getCalendarSelectedItemsDisplayValue([picked], formatter)).toBe('12/02/2013');
    });

    it('displays a stored value on its own day', () => {
      const stored = new Date('2013-12-02T00:00:00.000Z');

      expect(getCalendarSelectedItemsDisplayValue([stored], formatter)).toBe('12/02/2013');
    });

    it('returns undefined when nothing is selected', () => {
      expect(getCalendarSelectedItemsDisplayValue([], formatter)).toBeUndefined();
    });

    it('summarizes a multi-date selection instead of listing it', () => {
      const dates = [new Date('2013-12-02T00:00:00.000Z'), new Date('2013-12-03T00:00:00.000Z')];

      expect(getCalendarSelectedItemsDisplayValue(dates, formatter)).toBe('2 Dates selected');
    });
  });

  describe('round trip through the day mask', () => {
    it('survives pick -> display without drifting', () => {
      const picked = toUtcCalendarDate(dayjs(new Date(2013, 11, 2)));
      const serialized = formatter(picked, 'yyyy-MM-dd');

      expect(serialized).toBe('2013-12-02');
      expect(formatter(picked, getDefaultDateMask(DateLevels.Days))).toBe('12/02/2013');
    });
  });
});
