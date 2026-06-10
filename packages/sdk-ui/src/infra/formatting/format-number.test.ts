import { describe, expect, it } from 'vitest';

import { formatNumber } from './format-number';

describe('formatNumber', () => {
  it('returns empty string for NaN', () => {
    expect(formatNumber(NaN)).toBe('');
  });

  it('formats with default config (Numbers type, abbreviations enabled)', () => {
    // Default config applies K abbreviation for values >= 1000
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(1234567)).toBe('1.23M');
  });

  it('formats plain number without abbreviation when all abbreviations disabled', () => {
    const result = formatNumber(1000, {
      name: 'Numbers',
      kilo: false,
      million: false,
      billion: false,
      trillion: false,
    });
    expect(result).toBe('1,000');
  });

  it('formats with explicit decimalScale 0', () => {
    expect(formatNumber(1234.9, { name: 'Numbers', kilo: false, decimalScale: 0 })).toBe('1,235');
  });

  it('formats Percent type (multiplies by 100 and appends %)', () => {
    expect(formatNumber(0.42, { name: 'Percent', decimalScale: 1 })).toBe('42.0%');
  });

  it('formats Percent type with default decimal scale', () => {
    const result = formatNumber(0.1234, { name: 'Percent' });
    expect(result).toBe('12.34%');
  });

  it('formats Currency type with prefix symbol', () => {
    expect(formatNumber(1500, { name: 'Currency', symbol: '€', prefix: true })).toBe('€1.5K');
  });

  it('formats Currency type with suffix symbol (no abbreviation)', () => {
    const result = formatNumber(500, {
      name: 'Currency',
      symbol: '$',
      prefix: false,
      kilo: false,
      million: false,
      billion: false,
      trillion: false,
    });
    expect(result).toBe('500$');
  });

  it('formats Currency type with suffix symbol when abbreviation is applied', () => {
    // When abbreviation applies and prefix is false, symbol goes after abbreviation suffix
    const result = formatNumber(1500, {
      name: 'Currency',
      symbol: '$',
      prefix: false,
    });
    expect(result).toBe('1.5K$');
  });

  it('handles negative values', () => {
    expect(formatNumber(-1500)).toBe('-1.5K');
  });

  it('handles zero', () => {
    const result = formatNumber(0, { name: 'Numbers', kilo: false });
    expect(result).toBe('0');
  });
});
