import { createAttribute, filterFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  cleanNumber,
  endNumber,
  filterToNumberRange,
  hasNumberRangeErrors,
  hasSliderSpan,
  isEditableNumberRangeFilter,
  keyStep,
  numberRangeErrors,
  numberRangeToFilter,
  sliderStep,
  snapDrag,
} from './number-range.js';

const revenue = createAttribute({
  name: 'Revenue',
  expression: '[Commerce.Revenue]',
  type: 'numeric-attribute',
});

describe('numberRangeErrors', () => {
  it('never flags an empty field — it is an open end', () => {
    expect(numberRangeErrors({ min: '', max: '' })).toEqual({});
    expect(numberRangeErrors({ min: '300000', max: '' })).toEqual({});
    expect(numberRangeErrors({ min: '', max: '   ' })).toEqual({});
  });

  it('flags a non-empty entry that is not a number', () => {
    expect(numberRangeErrors({ min: '12abc', max: '' })).toEqual({ min: 'invalidNumber' });
    expect(numberRangeErrors({ min: '', max: 'mkk' })).toEqual({ max: 'invalidNumber' });
  });

  it('flags a number too large to represent', () => {
    expect(numberRangeErrors({ min: '1e309', max: '' })).toEqual({ min: 'invalidNumber' });
    expect(numberRangeErrors({ min: '', max: '-1e309' })).toEqual({ max: 'invalidNumber' });
    expect(endNumber('1e309')).toBeNull();
  });

  it('accepts any number, inside the column data or not — the data may grow later', () => {
    expect(numberRangeErrors({ min: '-50', max: '' })).toEqual({});
    expect(numberRangeErrors({ min: '', max: '99999999' })).toEqual({});
  });

  it('flags Maximum ≤ Minimum as an order error, equal included', () => {
    expect(numberRangeErrors({ min: '700000', max: '300000' })).toEqual({ order: true });
    expect(numberRangeErrors({ min: '500000', max: '500000' })).toEqual({ order: true });
    expect(numberRangeErrors({ min: '300000', max: '700000' })).toEqual({});
  });

  it('judges a per-field error before the order', () => {
    expect(numberRangeErrors({ min: 'x', max: '1' })).toEqual({ min: 'invalidNumber' });
    expect(hasNumberRangeErrors({ min: 'invalidNumber' })).toBe(true);
    expect(hasNumberRangeErrors({})).toBe(false);
  });
});

describe('endNumber / hasSliderSpan', () => {
  it('reads an end as a number only when it parses', () => {
    expect(endNumber(' 12.5 ')).toBe(12.5);
    expect(endNumber('')).toBeNull();
    expect(endNumber('12abc')).toBeNull();
  });

  it('needs two known, different bounds for a slider', () => {
    expect(hasSliderSpan(0, 10)).toBe(true);
    expect(hasSliderSpan(5, 5)).toBe(false);
    expect(hasSliderSpan(undefined, 10)).toBe(false);
    expect(hasSliderSpan(0, undefined)).toBe(false);
  });
});

describe('slider steps', () => {
  it('rounds a drag to four significant digits, never finer than the step', () => {
    expect(snapDrag(950_123, 1)).toBe(950_100);
    expect(snapDrag(12_345_678, 1)).toBe(12_350_000);
    expect(snapDrag(0.4, 1)).toBe(0);
    expect(snapDrag(12.6, 1)).toBe(13);
  });

  it('moves a key one unit of the fourth significant digit', () => {
    expect(keyStep(950_000, 1)).toBe(100);
    expect(keyStep(50, 1)).toBe(1);
  });

  it('keeps whole steps for whole-number data', () => {
    expect(sliderStep(100_000, 950_000)).toBe(1);
    expect(sliderStep(1, 5, 5)).toBe(1);
  });

  it('steps a column of fractions to fit about a thousand positions into its span', () => {
    expect(sliderStep(0.12, 0.87)).toBe(0.001);
    expect(sliderStep(0.5, 99.5)).toBe(0.1);
    expect(sliderStep(10.5, 950_000.25)).toBe(1);
  });

  it('reads whole edges with more distinct values than whole numbers between them as fractions', () => {
    expect(sliderStep(0, 1, 250)).toBe(0.001);
    expect(sliderStep(0, 100, 5000)).toBe(0.1);
  });

  it('rounds a drag over small numbers to their own magnitude, without float noise', () => {
    const step = sliderStep(0.12, 0.87);
    expect(snapDrag(0.4953, step)).toBe(0.495);
    expect(snapDrag(0.30000000000000004, step)).toBe(0.3);
    expect(keyStep(0.5, step)).toBe(0.001);
    expect(cleanNumber(0.12 + 0.001)).toBe(0.121);
  });
});

describe('Filter mapping', () => {
  it('publishes between for both ends', () => {
    const filter = numberRangeToFilter(revenue, { min: '10', max: '50' });
    expect(filter?.filterJaql()).toEqual({ from: 10, to: 50 });
  });

  it('keeps an open end open: ≥ for Minimum alone, ≤ for Maximum alone', () => {
    expect(numberRangeToFilter(revenue, { min: '10', max: '' })?.filterJaql()).toEqual({
      from: 10,
    });
    expect(numberRangeToFilter(revenue, { min: '', max: '50' })?.filterJaql()).toEqual({
      to: 50,
    });
  });

  it('publishes no filter for two empty ends', () => {
    expect(numberRangeToFilter(revenue, { min: '', max: '' })).toBeNull();
  });

  it('keeps the linked filter guid', () => {
    const filter = numberRangeToFilter(
      revenue,
      { min: '10', max: '' },
      filterFactory.between(revenue, 1, 2, { guid: 'g-1' }).config,
    );
    expect(filter?.config.guid).toBe('g-1');
  });

  it('reads back the ends a filter carries, an absent end empty', () => {
    expect(filterToNumberRange(filterFactory.between(revenue, 10, 50))).toEqual({
      min: '10',
      max: '50',
    });
    expect(filterToNumberRange(filterFactory.greaterThanOrEqual(revenue, 10))).toEqual({
      min: '10',
      max: '',
    });
    expect(filterToNumberRange(filterFactory.lessThanOrEqual(revenue, 50))).toEqual({
      min: '',
      max: '50',
    });
    expect(filterToNumberRange(null)).toEqual({ min: '', max: '' });
  });

  it('accepts only the inclusive shapes Range can show', () => {
    expect(isEditableNumberRangeFilter(filterFactory.between(revenue, 10, 50))).toBe(true);
    expect(isEditableNumberRangeFilter(filterFactory.greaterThanOrEqual(revenue, 10))).toBe(true);
    expect(isEditableNumberRangeFilter(filterFactory.lessThanOrEqual(revenue, 50))).toBe(true);
    expect(isEditableNumberRangeFilter(filterFactory.greaterThan(revenue, 10))).toBe(false);
    expect(isEditableNumberRangeFilter(filterFactory.equals(revenue, 10))).toBe(false);
    expect(
      isEditableNumberRangeFilter(
        filterFactory.intersection([
          filterFactory.greaterThanOrEqual(revenue, 10),
          filterFactory.lessThanOrEqual(revenue, 50),
        ]),
      ),
    ).toBe(false);
    expect(isEditableNumberRangeFilter(filterFactory.members(revenue, ['10']))).toBe(false);
    expect(isEditableNumberRangeFilter(null)).toBe(false);
  });
});
