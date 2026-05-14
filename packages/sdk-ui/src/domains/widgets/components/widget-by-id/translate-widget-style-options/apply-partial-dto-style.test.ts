import { describe, expect, it } from 'vitest';

import type { CartesianWidgetStyle, SunburstWidgetStyle, WidgetStyle } from '../types.js';
import { applyPartialDtoStyle } from './apply-partial-dto-style.js';

describe('applyPartialDtoStyle', () => {
  it('returns rebuilt unchanged when partial is undefined', () => {
    const rebuilt = { legend: { enabled: true, position: 'top' } } as unknown as WidgetStyle;
    expect(applyPartialDtoStyle(rebuilt, undefined)).toBe(rebuilt);
  });

  it('returns rebuilt unchanged when partial is empty', () => {
    const rebuilt = { legend: { enabled: true, position: 'top' } } as unknown as WidgetStyle;
    expect(applyPartialDtoStyle(rebuilt, {})).toBe(rebuilt);
  });

  it('fills gap fields the rebuild leaves untouched (sunburst center/*)', () => {
    const rebuilt = {
      'legend/enabled': true,
      'legend/position': 'bottom',
      'tooltip/value': true,
      'tooltip/contribution': false,
    } as unknown as SunburstWidgetStyle;
    const partial = {
      'center/value': true,
      'center/contribution': false,
      'center/contributionToParent': true,
    };
    expect(applyPartialDtoStyle(rebuilt, partial)).toEqual({
      'legend/enabled': true,
      'legend/position': 'bottom',
      'tooltip/value': true,
      'tooltip/contribution': false,
      'center/value': true,
      'center/contribution': false,
      'center/contributionToParent': true,
    });
  });

  it('rebuilt values win over partial on conflict', () => {
    const rebuilt = {
      legend: { enabled: true, position: 'bottom' },
    } as unknown as WidgetStyle;
    const partial = { legend: { enabled: false, position: 'top' } };
    const result = applyPartialDtoStyle(rebuilt, partial);
    expect(result).toEqual({ legend: { enabled: true, position: 'bottom' } });
  });

  it('deep-merges nested objects (axis labels)', () => {
    const rebuilt = {
      xAxis: { enabled: true, gridLines: false, labels: { enabled: true } },
    } as unknown as CartesianWidgetStyle;
    const partial = {
      xAxis: { ticks: false, labels: { rotation: 90, stepInterval: 5 } },
    };
    expect(applyPartialDtoStyle(rebuilt, partial)).toEqual({
      xAxis: {
        enabled: true,
        gridLines: false,
        ticks: false,
        labels: { enabled: true, rotation: 90, stepInterval: 5 },
      },
    });
  });

  it('does not mutate the rebuilt input', () => {
    const rebuilt = {
      xAxis: { enabled: true, labels: { enabled: true } },
    } as unknown as CartesianWidgetStyle;
    const partial = { xAxis: { ticks: false } };
    const before = JSON.parse(JSON.stringify(rebuilt));
    applyPartialDtoStyle(rebuilt, partial);
    expect(rebuilt).toEqual(before);
  });
});
