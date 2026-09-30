import { describe, expect, it } from 'vitest';

import {
  extractNarrativeWidgetStyleOptions,
  toNarrativeWidgetStyle,
} from './narrative-widget-style.js';

describe('narrative widget style', () => {
  it('reads automaticHeight as isAutoHeight, and nothing when it is absent', () => {
    expect(extractNarrativeWidgetStyleOptions({ automaticHeight: true })).toEqual({
      isAutoHeight: true,
    });
    expect(extractNarrativeWidgetStyleOptions({ automaticHeight: false })).toEqual({
      isAutoHeight: false,
    });
    expect(extractNarrativeWidgetStyleOptions({})).toEqual({});
    expect(extractNarrativeWidgetStyleOptions(undefined)).toEqual({});
  });

  it('writes isAutoHeight back as automaticHeight, and nothing when it is unset', () => {
    expect(toNarrativeWidgetStyle({ isAutoHeight: true })).toEqual({ automaticHeight: true });
    expect(toNarrativeWidgetStyle({ isAutoHeight: false })).toEqual({ automaticHeight: false });
    expect(toNarrativeWidgetStyle({})).toEqual({});
    expect(toNarrativeWidgetStyle(undefined)).toEqual({});
  });
});
