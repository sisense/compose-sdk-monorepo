import { describe, expect, it } from 'vitest';

import {
  CATALOGUE_ORDER,
  DEFAULT_TIME_FRAME_KEYS,
  LEVEL_FRAMES,
  RANGE_GRAINS,
  readTimeFramesInput,
  resolveTimeFrameKey,
  specKey,
} from './time-frame-catalogue';

describe('specKey', () => {
  it('encodes tense, count, grain into a canonical, ASCII string', () => {
    expect(specKey({ tense: 'last', count: 7, grain: 'Day' })).toBe('last:7:Day');
    expect(specKey({ tense: 'next', count: 3, grain: 'Year' })).toBe('next:3:Year');
    expect(specKey({ tense: 'this', count: 1, grain: 'Month' })).toBe('this:1:Month');
  });

  it('appends `:c` only when withCurrent is set — it splits paired frames from plain N', () => {
    expect(specKey({ tense: 'last', count: 2, grain: 'Month', withCurrent: true })).toBe(
      'last:2:Month:c',
    );
    // Same tense/count/grain without the paired flag → different key.
    expect(specKey({ tense: 'last', count: 2, grain: 'Month' })).toBe('last:2:Month');
  });

  it('normalises count to 1 for `this` regardless of the caller-passed count', () => {
    expect(specKey({ tense: 'this', count: 5, grain: 'Year' })).toBe('this:1:Year');
  });
});

describe('CATALOGUE_ORDER — catalogue ordering rule', () => {
  it('has exactly 47 frames, grouped Days → Weeks → Months → Quarters → Years', () => {
    expect(CATALOGUE_ORDER.length).toBe(47);
    // Group sizes: 9 Days · 9 Weeks · 11 Months · 9 Quarters · 9 Years.
    const sizes = RANGE_GRAINS.map((grain) => LEVEL_FRAMES[grain].length);
    expect(sizes).toEqual([9, 9, 11, 9, 9]);
  });

  it('emits the Days block first, then Weeks, Months, Quarters, Years in order', () => {
    const grainsInOrder = CATALOGUE_ORDER.map((frame) => frame.grain);
    // The first grain change goes Day → Week → Month → Quarter → Year — no interleaving.
    const dedup = grainsInOrder.filter((g, i) => g !== grainsInOrder[i - 1]);
    expect(dedup).toEqual(['Day', 'Week', 'Month', 'Quarter', 'Year']);
  });

  it('places `Today` first (Day grain, count 1) and `Next 3 years` last (Year grain, tail)', () => {
    expect(specKey(CATALOGUE_ORDER[0])).toBe('this:1:Day');
    expect(specKey(CATALOGUE_ORDER[CATALOGUE_ORDER.length - 1])).toBe('next:3:Year');
  });
});

describe('DEFAULT_TIME_FRAME_KEYS', () => {
  it('holds exactly the common 11 in catalogue order, with `Last 6 months` at position 7', () => {
    // Position 7 (index 6) groups the rolling look-back with the other Month-level frames.
    expect(DEFAULT_TIME_FRAME_KEYS).toEqual([
      'this:1:Day', // Today
      'last:1:Day', // Yesterday
      'this:1:Week', // This week
      'last:1:Week', // Last week
      'this:1:Month', // This month
      'last:1:Month', // Last month
      'last:6:Month', // Last 6 months — position 7
      'this:1:Quarter', // This quarter
      'last:1:Quarter', // Last quarter
      'this:1:Year', // This year
      'last:1:Year', // Last year
    ]);
  });

  it('every default key resolves in the catalogue — no orphans', () => {
    for (const key of DEFAULT_TIME_FRAME_KEYS) {
      expect(resolveTimeFrameKey(key), `expected ${key} to resolve`).toBeDefined();
    }
  });
});

describe('readTimeFramesInput — defensive read guard', () => {
  it('returns the default 11 when input is undefined', () => {
    const result = readTimeFramesInput(undefined).map(specKey);
    expect(result).toEqual(DEFAULT_TIME_FRAME_KEYS);
  });

  it('returns the default 11 when input is empty', () => {
    const result = readTimeFramesInput([]).map(specKey);
    expect(result).toEqual(DEFAULT_TIME_FRAME_KEYS);
  });

  it('drops unknown keys silently — a stored key later removed from the catalogue vanishes', () => {
    // `last:7:Day` is real, `this:1:Century` is not.
    const result = readTimeFramesInput([
      'last:7:Day',
      'this:1:Century', // unknown grain, dropped
      'this:1:Year',
    ]).map(specKey);
    expect(result).toEqual(['last:7:Day', 'this:1:Year']);
  });

  it('folds duplicates to a single entry', () => {
    const result = readTimeFramesInput(['this:1:Month', 'this:1:Month', 'last:1:Year']).map(
      specKey,
    );
    expect(result).toEqual(['this:1:Month', 'last:1:Year']);
  });

  it('re-orders the surviving keys by catalogue order, not caller order', () => {
    // Caller order: Year, Month, Day. Catalogue order: Day, Month, Year.
    const result = readTimeFramesInput(['this:1:Year', 'this:1:Month', 'this:1:Day']).map(specKey);
    expect(result).toEqual(['this:1:Day', 'this:1:Month', 'this:1:Year']);
  });

  it('falls back to the default 11 when fewer than 2 valid keys survive', () => {
    // One valid + one unknown → falls back to the default.
    const result = readTimeFramesInput(['this:1:Year', 'this:1:Century']).map(specKey);
    expect(result).toEqual(DEFAULT_TIME_FRAME_KEYS);
  });

  it('falls back to the default 11 when every input key is unknown', () => {
    const result = readTimeFramesInput(['not:a:Key', 'also:not:Real']).map(specKey);
    expect(result).toEqual(DEFAULT_TIME_FRAME_KEYS);
  });
});

describe('LEVEL_FRAMES — per-grain shape', () => {
  it('every frame in the catalogue is a valid Level entry — index sanity', () => {
    for (const grain of RANGE_GRAINS) {
      for (const frame of LEVEL_FRAMES[grain]) {
        expect(frame.grain).toBe(grain);
      }
    }
  });

  it('paired frames (This & last / This & next) carry `withCurrent: true` and count 2', () => {
    const paired = CATALOGUE_ORDER.filter((frame) => frame.withCurrent);
    // 4 grains × 2 pairs (last, next) = 8. Day has no pair.
    expect(paired.length).toBe(8);
    for (const frame of paired) {
      expect(frame.count).toBe(2);
      expect(frame.grain).not.toBe('Day');
    }
  });
});
