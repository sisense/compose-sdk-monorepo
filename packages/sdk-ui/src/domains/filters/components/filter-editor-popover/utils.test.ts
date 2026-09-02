import { filterFactory, isRankingFilter, measureFactory } from '@sisense/sdk-data';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { asUtcDate, convertDateToMemberString, isSupportedByFilterEditor } from './utils.js';

describe('filter-editor-popover utils', () => {
  it('supports ranking filters in the filter editor', () => {
    const measure = measureFactory.sum(DM.Commerce.Revenue);
    const filter = filterFactory.topRanking(DM.Commerce.AgeRange, measure, 5);

    expect(isRankingFilter(filter)).toBe(true);
    expect(isSupportedByFilterEditor(filter)).toBe(true);
  });
});

describe('convertDateToMemberString', () => {
  const ORIGINAL_TZ = process.env.TZ;

  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  describe.each(['UTC', 'Europe/Kiev', 'Asia/Tokyo', 'America/New_York', 'Pacific/Honolulu'])(
    'in %s',
    (tz) => {
      beforeEach(() => {
        process.env.TZ = tz;
      });

      it('names the day the date represents regardless of the viewer timezone', () => {
        const date = new Date('2013-12-02T00:00:00.000Z');

        expect(convertDateToMemberString(date)).toBe('2013-12-02T00:00:00');
      });

      it('pads single-digit months and days', () => {
        const date = new Date('2024-01-05T00:00:00.000Z');

        expect(convertDateToMemberString(date)).toBe('2024-01-05T00:00:00');
      });
    },
  );
});

describe('asUtcDate', () => {
  const ORIGINAL_TZ = process.env.TZ;

  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  describe.each(['UTC', 'Europe/Kiev', 'Asia/Tokyo', 'America/New_York', 'Pacific/Honolulu'])(
    'in %s',
    (tz) => {
      beforeEach(() => {
        process.env.TZ = tz;
      });

      it('anchors a timezone-less value to UTC midnight of the day it names', () => {
        expect(asUtcDate('2013-12-02T00:00:00').toISOString()).toBe('2013-12-02T00:00:00.000Z');
      });

      it('anchors a date-only value to UTC midnight of the day it names', () => {
        expect(asUtcDate('2013-12-02').toISOString()).toBe('2013-12-02T00:00:00.000Z');
      });

      it('keeps the instant of a value that already carries a timezone', () => {
        expect(asUtcDate('2013-12-02T00:00:00Z').toISOString()).toBe('2013-12-02T00:00:00.000Z');
        expect(asUtcDate('2013-12-02T00:00:00+02:00').toISOString()).toBe(
          '2013-12-01T22:00:00.000Z',
        );
      });

      it('passes a Date through untouched', () => {
        const date = new Date('2013-12-02T00:00:00.000Z');

        expect(asUtcDate(date)).toBe(date);
      });

      it('round-trips through convertDateToMemberString', () => {
        expect(convertDateToMemberString(asUtcDate('2013-12-02T00:00:00'))).toBe(
          '2013-12-02T00:00:00',
        );
      });
    },
  );
});
