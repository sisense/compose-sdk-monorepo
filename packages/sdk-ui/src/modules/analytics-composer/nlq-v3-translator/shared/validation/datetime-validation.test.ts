import { DateLevels, filterFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../../__mocks__/mock-data-sources.js';
import {
  createAttributeFromName,
  createSchemaIndex,
  REQUIRE_EXPLICIT_DATE_LEVEL,
} from '../utils/schema-index.js';
import {
  validateDatetimeMemberStrings,
  validateNoDuplicateMembers,
} from './datetime-member-validation.js';
import { normalizeDatetimeRangeBound, validateDatetimeRange } from './datetime-range-validation.js';
import { validateDatetimeRelativeFilter } from './datetime-relative-validation.js';
import {
  getDateColumnDisplayName,
  isCompactYearWeekKey,
  isValidIsoDateString,
} from './datetime-validation-utils.js';
import { flattenFilters } from './flatten-filters.js';
import { normalizeMemberForGranularity } from './normalize-member-for-granularity.js';
import { validateQueryDatetimeConsistency } from './query-datetime-validation.js';

const schemaIndex = createSchemaIndex(MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE);

function createDateLevelAttribute(name: string) {
  return createAttributeFromName(
    name,
    MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
    schemaIndex,
    REQUIRE_EXPLICIT_DATE_LEVEL,
  );
}

describe('datetime validation utils', () => {
  it('should detect compact YYYYWW keys', () => {
    expect(isCompactYearWeekKey('202500')).toBe(true);
    expect(isCompactYearWeekKey('2024-12-30')).toBe(false);
  });

  it('should validate ISO date strings', () => {
    expect(isValidIsoDateString('2024-01-01T00:00:00')).toBe(true);
    expect(isValidIsoDateString('202500')).toBe(false);
  });
});

describe('datetime member validation', () => {
  it('should reject compact week members', () => {
    expect(() => validateDatetimeMemberStrings(['202500'], DateLevels.Weeks, 'filters[0]')).toThrow(
      /filters\[0\]\.args\[1\]\[0\]: compact week key/,
    );
  });

  it('should reject bare week numbers', () => {
    expect(() => validateDatetimeMemberStrings(['52'], DateLevels.Weeks, 'filters[0]')).toThrow(
      /bare week number/,
    );
  });

  it('should reject numeric non-year members for period granularities', () => {
    expect(() => validateDatetimeMemberStrings(['12345'], DateLevels.Months, 'filters[0]')).toThrow(
      /numeric member/,
    );
  });

  it('should treat empty member lists as include-all no-op', () => {
    expect(() => validateDatetimeMemberStrings([], DateLevels.Weeks, 'filters[0]')).not.toThrow();
  });

  it('should reject non-array members', () => {
    expect(() =>
      // Intentionally pass a non-array at runtime to cover the malformed-input guard.
      validateDatetimeMemberStrings(
        '2024-01-01T00:00:00' as unknown as string[],
        DateLevels.Weeks,
        'filters[0]',
      ),
    ).toThrow(/at least one member/);
  });

  it('should reject WeekOfYear members filters', () => {
    expect(() =>
      validateDatetimeMemberStrings(['2024-01-01T00:00:00'], DateLevels.WeekOfYear, 'filters[0]'),
    ).toThrow(/filters\[0\]\.args\[0\]: filterFactory\.members does not support WeekOfYear/);
  });

  it('should allow Years members as 4-digit year or ISO datetime', () => {
    expect(() =>
      validateDatetimeMemberStrings(['2024'], DateLevels.Years, 'filters[0]'),
    ).not.toThrow();
    expect(() =>
      validateDatetimeMemberStrings(['2024-06-15T00:00:00'], DateLevels.Years, 'filters[0]'),
    ).not.toThrow();
  });

  it('should reject duplicate members after normalization', () => {
    expect(() =>
      validateNoDuplicateMembers(['2024-01-01T00:00:00', '2024-01-01T00:00:00'], 'filters[0]'),
    ).toThrow(/duplicate member/);
  });
});

describe('normalizeMemberForGranularity', () => {
  it('should normalize Years from 4-digit year', () => {
    expect(normalizeMemberForGranularity('2024', DateLevels.Years)).toBe('2024-01-01T00:00:00');
  });

  it('should normalize Years from ISO datetime to start of year', () => {
    expect(normalizeMemberForGranularity('2024-06-15T12:00:00', DateLevels.Years)).toBe(
      '2024-01-01T00:00:00',
    );
  });

  it('should normalize Quarters to start of quarter', () => {
    expect(normalizeMemberForGranularity('2024-05-15T12:00:00', DateLevels.Quarters)).toBe(
      '2024-04-01T00:00:00',
    );
  });

  it('should normalize Months to start of month', () => {
    expect(normalizeMemberForGranularity('2024-05-15T12:00:00', DateLevels.Months)).toBe(
      '2024-05-01T00:00:00',
    );
  });

  it('should normalize Weeks to ISO start-of-week datetimes', () => {
    expect(normalizeMemberForGranularity('2024-12-31T12:00:00', DateLevels.Weeks)).toBe(
      '2024-12-30T00:00:00',
    );
  });

  it('should normalize Days to start of day', () => {
    expect(normalizeMemberForGranularity('2024-05-15T15:30:00', DateLevels.Days)).toBe(
      '2024-05-15T00:00:00',
    );
  });
});

describe('datetime range validation', () => {
  it('should require at least one bound on dateRange', () => {
    expect(() =>
      validateDatetimeRange(DateLevels.Days, undefined, undefined, 'filters[0]'),
    ).toThrow(/at least one of 'from' or 'to'/);
  });

  it('should reject from greater than to', () => {
    expect(() =>
      validateDatetimeRange(DateLevels.Days, '2026-05-06', '2026-05-05', 'filters[0]'),
    ).toThrow(/'from' must be less than or equal to 'to'/);
  });

  it('should reject identical from/to datetimes with time components', () => {
    expect(() =>
      validateDatetimeRange(
        DateLevels.Days,
        '2026-05-05T00:00:00',
        '2026-05-05T00:00:00',
        'filters[0]',
      ),
    ).toThrow(/empty half-open range/);
  });

  it('should reject T23:59:59 exclusive upper bound anti-pattern', () => {
    expect(() =>
      validateDatetimeRange(
        DateLevels.Days,
        '2026-05-05T00:00:00',
        '2026-05-05T23:59:59',
        'filters[0]',
      ),
    ).toThrow(/T23:59:59/);
  });

  it('should reject T23:59:59 anti-pattern on to-only bounds', () => {
    expect(() =>
      validateDatetimeRange(DateLevels.Days, undefined, '2026-05-05T23:59:59', 'filters[0]'),
    ).toThrow(/T23:59:59/);
  });

  it('should reject invalid ISO bounds', () => {
    expect(() =>
      validateDatetimeRange(DateLevels.Days, 'not-a-date', undefined, 'filters[0]'),
    ).toThrow(/invalid date bound/);
  });

  it('should strip clock time from period granularity bounds', () => {
    expect(normalizeDatetimeRangeBound('2026-05-05T15:30:00', DateLevels.Days)).toBe('2026-05-05');
    expect(normalizeDatetimeRangeBound('2026-05-05T15:30:00', DateLevels.Months)).toBe(
      '2026-05-05',
    );
  });

  it('should allow same-day date-only from/to on Days level', () => {
    expect(() =>
      validateDatetimeRange(DateLevels.Days, '2026-05-05', '2026-05-05', 'filters[0]'),
    ).not.toThrow();
  });
});

describe('datetime relative validation', () => {
  it('should reject unsupported granularities', () => {
    expect(() =>
      validateDatetimeRelativeFilter(DateLevels.WeekOfYear, 0, 1, undefined, 'filters[0]'),
    ).toThrow(/do not support WeekOfYear/);
  });

  it('should reject count less than or equal to zero', () => {
    expect(() =>
      validateDatetimeRelativeFilter(DateLevels.Days, 0, 0, undefined, 'filters[0]'),
    ).toThrow(/count must be greater than zero/);
  });

  it('should reject excessive offset magnitude', () => {
    expect(() =>
      validateDatetimeRelativeFilter(DateLevels.Days, 10001, 1, undefined, 'filters[0]'),
    ).toThrow(/offset magnitude must be at most 10000/);
  });

  it('should reject invalid anchor dates', () => {
    expect(() =>
      validateDatetimeRelativeFilter(DateLevels.Days, 0, 1, 'not-a-date', 'filters[0]'),
    ).toThrow(/anchor must be a valid ISO date or datetime/);
  });

  it('should accept valid relative filter arguments', () => {
    expect(() =>
      validateDatetimeRelativeFilter(DateLevels.Days, -7, 30, '2024-01-01T00:00:00', 'filters[0]'),
    ).not.toThrow();
  });
});

describe('flattenFilters', () => {
  it('should flatten nested filter relations trees', () => {
    const weeksFilter = filterFactory.members(createDateLevelAttribute('DM.Commerce.Date.Weeks'), [
      '2024-12-30T00:00:00',
    ]);
    const monthsFilter = filterFactory.members(
      createDateLevelAttribute('DM.Commerce.Date.Months'),
      ['2024-01-01T00:00:00'],
    );
    const nested = filterFactory.logic.and(weeksFilter, monthsFilter);

    expect(flattenFilters(nested)).toHaveLength(2);
    expect(flattenFilters(null)).toEqual([]);
  });
});

describe('query datetime validation', () => {
  it('should allow dimension vs filter granularity mismatch on the same column', () => {
    const yearsDimension = createDateLevelAttribute('DM.Commerce.Date.Years');
    const quartersFilterAttribute = createDateLevelAttribute('DM.Commerce.Date.Quarters');

    const errors = validateQueryDatetimeConsistency({
      dimensions: [yearsDimension],
      filters: [filterFactory.members(quartersFilterAttribute, ['2024-01-01T00:00:00'])],
      highlights: null,
    });

    expect(errors).toHaveLength(0);
  });

  it('should derive Commerce.Date display name from composeCode', () => {
    const attribute = createDateLevelAttribute('DM.Commerce.Date.Weeks');
    expect(getDateColumnDisplayName(attribute)).toBe('Commerce.Date');
  });

  it('should reject multiple filters on the same column at different levels', () => {
    const weeksFilter = filterFactory.members(createDateLevelAttribute('DM.Commerce.Date.Weeks'), [
      '2024-12-30T00:00:00',
    ]);
    const monthsFilter = filterFactory.members(
      createDateLevelAttribute('DM.Commerce.Date.Months'),
      ['2024-01-01T00:00:00'],
    );

    const errors = validateQueryDatetimeConsistency({
      dimensions: [],
      filters: [weeksFilter, monthsFilter],
      highlights: null,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].path).toBe('filters');
    expect(errors[0].message).toContain('Date filter on Weeks (filters[0])');
    expect(errors[0].message).toContain('Date filter on Months (filters[1])');
    expect(errors[0].message).toContain("'Commerce.Date'");
  });

  it('should allow highlight vs dimension granularity mismatch on the same column', () => {
    const yearsDimension = createDateLevelAttribute('DM.Commerce.Date.Years');
    const weeksHighlight = filterFactory.members(
      createDateLevelAttribute('DM.Commerce.Date.Weeks'),
      ['2024-12-30T00:00:00'],
    );

    const errors = validateQueryDatetimeConsistency({
      dimensions: [yearsDimension],
      filters: [],
      highlights: [weeksHighlight],
    });

    expect(errors).toHaveLength(0);
  });
});
