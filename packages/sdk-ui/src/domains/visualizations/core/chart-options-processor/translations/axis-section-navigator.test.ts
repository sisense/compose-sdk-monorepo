import { describe, expect, it, vi } from 'vitest';

import {
  attachNavigatorScrollerToPrimaryXAxis,
  type AxisSettings,
  type NavigatorAxisSetExtremesEvent,
  withScrollerEvent,
} from './axis-section';

describe('attachNavigatorScrollerToPrimaryXAxis', () => {
  it('returns a copy of an empty axis list', () => {
    const axes: AxisSettings[] = [];
    const next = attachNavigatorScrollerToPrimaryXAxis(axes, vi.fn());
    expect(next).toEqual([]);
    expect(next).not.toBe(axes);
  });

  it('invokes onScrollerChange only for navigator-triggered extremes', () => {
    const onScrollerChange = vi.fn();
    const axes: AxisSettings[] = [{ type: 'linear' }, { type: 'linear' }];
    const [primary] = attachNavigatorScrollerToPrimaryXAxis(axes, onScrollerChange);

    const handler = primary.events?.afterSetExtremes;
    expect(handler).toBeDefined();

    handler?.({ min: 1, max: 2, trigger: 'zoom' } as NavigatorAxisSetExtremesEvent);
    expect(onScrollerChange).not.toHaveBeenCalled();

    handler?.({ min: 10, max: 20, trigger: 'navigator' } as NavigatorAxisSetExtremesEvent);
    expect(onScrollerChange).toHaveBeenCalledWith(10, 20);
  });

  it('chains an existing afterSetExtremes handler before the navigator callback', () => {
    const previous = vi.fn();
    const onScrollerChange = vi.fn();
    const axes: AxisSettings[] = [
      {
        type: 'linear',
        events: { afterSetExtremes: previous },
      },
    ];

    const [primary] = attachNavigatorScrollerToPrimaryXAxis(axes, onScrollerChange);
    const event = { min: 5, max: 6, trigger: 'navigator' } as NavigatorAxisSetExtremesEvent;
    primary.events?.afterSetExtremes?.(event);

    expect(previous).toHaveBeenCalledWith(event);
    expect(onScrollerChange).toHaveBeenCalledWith(5, 6);
  });

  it('leaves secondary axes unchanged except for array position', () => {
    const secondary: AxisSettings = { type: 'linear', opposite: true };
    const axes: AxisSettings[] = [{ type: 'linear' }, secondary];
    const next = attachNavigatorScrollerToPrimaryXAxis(axes, vi.fn());
    expect(next[1]).toBe(secondary);
  });
});

describe('withScrollerEvent', () => {
  it('returns a new array copy with axes unchanged when callback is undefined', () => {
    const axes: AxisSettings[] = [{ type: 'linear' }, { type: 'logarithmic' }];
    const result = withScrollerEvent(undefined)(axes);
    expect(result).toEqual(axes);
    expect(result).not.toBe(axes);
  });

  it('returns a new array copy with axes unchanged when callback is absent', () => {
    const axes: AxisSettings[] = [];
    const result = withScrollerEvent()(axes);
    expect(result).toEqual([]);
    expect(result).not.toBe(axes);
  });

  it('delegates to attachNavigatorScrollerToPrimaryXAxis when callback is provided', () => {
    const onScrollerChange = vi.fn();
    const axes: AxisSettings[] = [{ type: 'linear' }];
    const result = withScrollerEvent(onScrollerChange)(axes);

    const handler = result[0].events?.afterSetExtremes;
    expect(handler).toBeDefined();

    handler?.({ min: 5, max: 10, trigger: 'navigator' } as NavigatorAxisSetExtremesEvent);
    expect(onScrollerChange).toHaveBeenCalledWith(5, 10);
  });

  it('does not fire callback for non-navigator triggers', () => {
    const onScrollerChange = vi.fn();
    const axes: AxisSettings[] = [{ type: 'linear' }];
    const result = withScrollerEvent(onScrollerChange)(axes);

    result[0].events?.afterSetExtremes?.({
      min: 0,
      max: 100,
      trigger: 'zoom',
    } as NavigatorAxisSetExtremesEvent);

    expect(onScrollerChange).not.toHaveBeenCalled();
  });
});
