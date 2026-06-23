import { describe, expect, it } from 'vitest';

import {
  hasPivotContainerSizeChanged,
  resolvePivotContainerSize,
} from './resolve-pivot-container-size.js';

describe('resolvePivotContainerSize', () => {
  const padding = { vertical: 8, horizontal: 16 };

  it('derives the viewport from the container size on first measure', () => {
    expect(resolvePivotContainerSize({ width: 400, height: 300 }, padding, null, true)).toEqual({
      width: 384,
      height: 292,
    });
  });

  it('keeps the previous height in auto-height mode when the container grows', () => {
    const previous = { width: 384, height: 292 };
    expect(resolvePivotContainerSize({ width: 400, height: 400 }, padding, previous, true)).toEqual(
      { width: 384, height: 292 },
    );
  });

  it('tracks container height when auto-height is disabled', () => {
    const previous = { width: 384, height: 292 };
    expect(
      resolvePivotContainerSize({ width: 400, height: 400 }, padding, previous, false),
    ).toEqual({ width: 384, height: 392 });
    expect(
      resolvePivotContainerSize({ width: 400, height: 200 }, padding, previous, false),
    ).toEqual({ width: 384, height: 192 });
  });

  it('updates width in auto-height mode when the container width changes', () => {
    const previous = { width: 384, height: 292 };
    expect(resolvePivotContainerSize({ width: 500, height: 400 }, padding, previous, true)).toEqual(
      { width: 484, height: 292 },
    );
  });
});

describe('hasPivotContainerSizeChanged', () => {
  it('returns true when there is no previous size', () => {
    expect(hasPivotContainerSizeChanged(null, { width: 1, height: 1 })).toBe(true);
  });

  it('returns false when width and height are unchanged', () => {
    const size = { width: 100, height: 200 };
    expect(hasPivotContainerSizeChanged(size, size)).toBe(false);
  });

  it('returns true when width changes', () => {
    expect(
      hasPivotContainerSizeChanged({ width: 100, height: 200 }, { width: 150, height: 200 }),
    ).toBe(true);
  });

  it('returns true when height changes', () => {
    expect(
      hasPivotContainerSizeChanged({ width: 100, height: 200 }, { width: 100, height: 250 }),
    ).toBe(true);
  });
});
