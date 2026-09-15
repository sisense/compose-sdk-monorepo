import { describe, expect, it } from 'vitest';

import { dayKeyTarget, firstPickable, isGridKey } from './calendar-keys';

const SEP_15 = new Date(2026, 8, 15); // a Tuesday
const SUNDAY_START = 0;
const MONDAY_START = 1;

describe('isGridKey', () => {
  it('claims the keys the grid moves by', () => {
    [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ].forEach((key) => expect(isGridKey(key)).toBe(true));
  });

  it('leaves everything else alone', () => {
    ['Enter', ' ', 'Escape', 'Tab', 'a'].forEach((key) => expect(isGridKey(key)).toBe(false));
  });
});

describe('dayKeyTarget', () => {
  it('steps one day sideways', () => {
    expect(dayKeyTarget('ArrowLeft', false, SEP_15, SUNDAY_START)).toEqual({
      target: new Date(2026, 8, 14),
      direction: -1,
    });
    expect(dayKeyTarget('ArrowRight', false, SEP_15, SUNDAY_START)).toEqual({
      target: new Date(2026, 8, 16),
      direction: 1,
    });
  });

  it('steps one week vertically, keeping the weekday', () => {
    expect(dayKeyTarget('ArrowUp', false, SEP_15, SUNDAY_START)?.target).toEqual(
      new Date(2026, 8, 8),
    );
    expect(dayKeyTarget('ArrowDown', false, SEP_15, SUNDAY_START)?.target).toEqual(
      new Date(2026, 8, 22),
    );
  });

  it('goes to the ends of the focused day’s week, following the week start', () => {
    // Sunday-start: the week around Tue Sep 15 runs Sun 13 to Sat 19.
    expect(dayKeyTarget('Home', false, SEP_15, SUNDAY_START)?.target).toEqual(
      new Date(2026, 8, 13),
    );
    expect(dayKeyTarget('End', false, SEP_15, SUNDAY_START)?.target).toEqual(new Date(2026, 8, 19));
    // Monday-start: the same week runs Mon 14 to Sun 20.
    expect(dayKeyTarget('Home', false, SEP_15, MONDAY_START)?.target).toEqual(
      new Date(2026, 8, 14),
    );
    expect(dayKeyTarget('End', false, SEP_15, MONDAY_START)?.target).toEqual(new Date(2026, 8, 20));
  });

  it('pages by month, and by year with shift', () => {
    expect(dayKeyTarget('PageUp', false, SEP_15, SUNDAY_START)?.target).toEqual(
      new Date(2026, 7, 15),
    );
    expect(dayKeyTarget('PageDown', false, SEP_15, SUNDAY_START)?.target).toEqual(
      new Date(2026, 9, 15),
    );
    expect(dayKeyTarget('PageUp', true, SEP_15, SUNDAY_START)?.target).toEqual(
      new Date(2025, 8, 15),
    );
    expect(dayKeyTarget('PageDown', true, SEP_15, SUNDAY_START)?.target).toEqual(
      new Date(2027, 8, 15),
    );
  });

  it('clamps a paged date the target month does not have', () => {
    // January 31st paged forward lands on the last day of February, not March 3rd.
    expect(dayKeyTarget('PageDown', false, new Date(2026, 0, 31), SUNDAY_START)?.target).toEqual(
      new Date(2026, 1, 28),
    );
    expect(dayKeyTarget('PageDown', false, new Date(2024, 0, 31), SUNDAY_START)?.target).toEqual(
      new Date(2024, 1, 29),
    );
  });

  it('returns null for a key it does not handle', () => {
    expect(dayKeyTarget('Enter', false, SEP_15, SUNDAY_START)).toBeNull();
  });
});

describe('firstPickable', () => {
  it('returns the target when nothing blocks it', () => {
    expect(firstPickable(SEP_15, 1, () => false)).toEqual(SEP_15);
  });

  it('steps over blocked days in the direction of travel', () => {
    const blocked = (day: Date) => day.getDate() < 18;
    expect(firstPickable(SEP_15, 1, blocked)).toEqual(new Date(2026, 8, 18));
  });

  it('gives up rather than spinning when nothing that way is pickable', () => {
    expect(firstPickable(SEP_15, 1, () => true)).toBeNull();
  });
});
