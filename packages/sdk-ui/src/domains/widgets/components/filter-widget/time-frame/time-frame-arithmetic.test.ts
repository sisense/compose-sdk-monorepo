import { describe, expect, it } from 'vitest';

import { addGrains, resolveRelative, startOfGrain } from './time-frame-arithmetic';

/** Frozen civil "now" — every resolution assertion below is evaluated against it. */
const TODAY = new Date(2026, 8, 21); // 2026-09-21 (JS months are 0-based)

/** Shorthand: build an inclusive range from ISO-ish date parts. */
const range = (start: [number, number, number], end: [number, number, number]) => ({
  start: new Date(start[0], start[1] - 1, start[2]),
  end: new Date(end[0], end[1] - 1, end[2]),
});

describe('startOfGrain', () => {
  it('returns midnight starting the period that contains the date', () => {
    expect(startOfGrain(new Date(2026, 8, 21), 'Day')).toEqual(new Date(2026, 8, 21));
    expect(startOfGrain(new Date(2026, 8, 21), 'Month')).toEqual(new Date(2026, 8, 1));
    expect(startOfGrain(new Date(2026, 8, 21), 'Quarter')).toEqual(new Date(2026, 6, 1));
    expect(startOfGrain(new Date(2026, 8, 21), 'Year')).toEqual(new Date(2026, 0, 1));
  });
});

describe('addGrains', () => {
  it('adds whole periods, aligned to the grain', () => {
    expect(addGrains(new Date(2026, 8, 21), 'Day', 7)).toEqual(new Date(2026, 8, 28));
    expect(addGrains(new Date(2026, 0, 1), 'Month', 12)).toEqual(new Date(2027, 0, 1));
    expect(addGrains(new Date(2026, 0, 1), 'Quarter', -1)).toEqual(new Date(2025, 9, 1));
  });
});

/**
 * With today frozen to 2026-09-21, every frame in the catalogue resolves to the
 * expected calendar dates. Covers the load-bearing rules — Day-grain rolling
 * exception, `This & last` vs `Last 2` split, cross-year windows.
 */
describe('resolveRelative', () => {
  it('Today → Sep 21, 2026 (single day)', () => {
    expect(resolveRelative({ tense: 'this', count: 1, grain: 'Day' }, TODAY)).toEqual(
      range([2026, 9, 21], [2026, 9, 21]),
    );
  });

  it('Yesterday → Sep 20, 2026', () => {
    expect(resolveRelative({ tense: 'last', count: 1, grain: 'Day' }, TODAY)).toEqual(
      range([2026, 9, 20], [2026, 9, 20]),
    );
  });

  it('Tomorrow → Sep 22, 2026', () => {
    expect(resolveRelative({ tense: 'next', count: 1, grain: 'Day' }, TODAY)).toEqual(
      range([2026, 9, 22], [2026, 9, 22]),
    );
  });

  it('This month → Sep 1, 2026 – Sep 30, 2026', () => {
    expect(resolveRelative({ tense: 'this', count: 1, grain: 'Month' }, TODAY)).toEqual(
      range([2026, 9, 1], [2026, 9, 30]),
    );
  });

  it('Last month → Aug 1, 2026 – Aug 31, 2026', () => {
    expect(resolveRelative({ tense: 'last', count: 1, grain: 'Month' }, TODAY)).toEqual(
      range([2026, 8, 1], [2026, 8, 31]),
    );
  });

  it('This & last month → Aug 1, 2026 – Sep 30, 2026 (paired: includes current)', () => {
    expect(
      resolveRelative({ tense: 'last', count: 2, grain: 'Month', withCurrent: true }, TODAY),
    ).toEqual(range([2026, 8, 1], [2026, 9, 30]));
  });

  it('Last 2 months → Jul 1, 2026 – Aug 31, 2026 (plain: excludes current)', () => {
    expect(resolveRelative({ tense: 'last', count: 2, grain: 'Month' }, TODAY)).toEqual(
      range([2026, 7, 1], [2026, 8, 31]),
    );
  });

  it('This year → Jan 1, 2026 – Dec 31, 2026', () => {
    expect(resolveRelative({ tense: 'this', count: 1, grain: 'Year' }, TODAY)).toEqual(
      range([2026, 1, 1], [2026, 12, 31]),
    );
  });

  it('Last 7 days → Sep 15, 2026 – Sep 21, 2026 (Day-grain rolling: ends TODAY)', () => {
    expect(resolveRelative({ tense: 'last', count: 7, grain: 'Day' }, TODAY)).toEqual(
      range([2026, 9, 15], [2026, 9, 21]),
    );
  });

  it('Next 7 days → Sep 22, 2026 – Sep 28, 2026 (starts tomorrow — the exception is one-sided)', () => {
    expect(resolveRelative({ tense: 'next', count: 7, grain: 'Day' }, TODAY)).toEqual(
      range([2026, 9, 22], [2026, 9, 28]),
    );
  });

  it('Last 30 days and Last 90 days also end today (Day-grain rolling)', () => {
    // 30 days ending today: Aug 23 – Sep 21.
    expect(resolveRelative({ tense: 'last', count: 30, grain: 'Day' }, TODAY)).toEqual(
      range([2026, 8, 23], [2026, 9, 21]),
    );
    // 90 days ending today: Jun 24 – Sep 21.
    expect(resolveRelative({ tense: 'last', count: 90, grain: 'Day' }, TODAY)).toEqual(
      range([2026, 6, 24], [2026, 9, 21]),
    );
  });

  it('Last 2 X and This & last X are never the same range', () => {
    const paired = resolveRelative(
      { tense: 'last', count: 2, grain: 'Quarter', withCurrent: true },
      TODAY,
    );
    const plain = resolveRelative({ tense: 'last', count: 2, grain: 'Quarter' }, TODAY);
    expect(paired).not.toEqual(plain);
  });

  it('Last 7 days meets Next 7 days around today with no gap and no overlap', () => {
    const last7 = resolveRelative({ tense: 'last', count: 7, grain: 'Day' }, TODAY);
    const next7 = resolveRelative({ tense: 'next', count: 7, grain: 'Day' }, TODAY);
    // last7.end = today; next7.start = today + 1 day → adjacent, gap-free.
    expect(last7.end).toEqual(TODAY);
    expect(next7.start).toEqual(new Date(2026, 8, 22));
  });
});
