import { describe, expect, it } from 'vitest';

import { formatDate, getDefaultDateFormat } from './format-date';

describe('formatDate', () => {
  it('formats a Date instance with MM/yyyy mask', () => {
    expect(formatDate(new Date('2026-03-15T00:00:00Z'), 'MM/yyyy')).toBe('03/2026');
  });

  it('formats an ISO 8601 string', () => {
    const result = formatDate('2026-01-05T00:00:00Z', 'yyyy-MM-dd');
    expect(result).toBe('2026-01-05');
  });

  it('returns N/A sentinel unchanged', () => {
    expect(formatDate('N\\A', 'yyyy')).toBe('N\\A');
  });

  it('formats year with yyyy mask', () => {
    expect(formatDate(new Date('2025-07-01T00:00:00Z'), 'yyyy')).toBe('2025');
  });

  it('applies custom dateConfig timezone', () => {
    // UTC date is 2026-03-15, with UTC timezone it should stay the same day
    const result = formatDate('2026-03-15T12:00:00Z', 'yyyy-MM-dd', {
      dateConfig: {
        isFiscalOn: false,
        fiscalMonth: 0,
        weekFirstDay: 1,
        selectedDateLevel: 'days',
        timeZone: 'UTC',
      },
    });
    expect(result).toBe('2026-03-15');
  });

  it('handles 2-digit year by normalizing to 1900+', () => {
    // Date with year < 100 should be treated as 1900+year
    const date = new Date(0);
    date.setFullYear(99);
    date.setMonth(0);
    date.setDate(1);
    const result = formatDate(date, 'yyyy');
    expect(result).toBe('1999');
  });
});

describe('getDefaultDateFormat', () => {
  // DateLevels constants are PascalCase ('Years', 'Months', 'Days', etc.)
  it('returns yyyy for Years granularity', () => {
    expect(getDefaultDateFormat('Years')).toBe('yyyy');
  });

  it('returns MM/yyyy for Months granularity', () => {
    expect(getDefaultDateFormat('Months')).toBe('MM/yyyy');
  });

  it('returns shortDate for Days granularity', () => {
    expect(getDefaultDateFormat('Days')).toBe('shortDate');
  });

  it('returns ww yyyy for Weeks granularity', () => {
    expect(getDefaultDateFormat('Weeks')).toBe('ww yyyy');
  });

  it('returns Q yyyy for Quarters granularity', () => {
    expect(getDefaultDateFormat('Quarters')).toBe('Q yyyy');
  });

  it('returns fullDate for unknown granularity', () => {
    expect(getDefaultDateFormat('unknown')).toBe('fullDate');
  });

  it('returns fullDate when granularity is undefined', () => {
    expect(getDefaultDateFormat()).toBe('fullDate');
  });
});
