import { CompleteThemeSettings } from '@/types';

import { getShadowValue } from './widget-style-utils';

const themeSettings = {
  widget: {
    shadow: 'None',
    spaceAround: 'None',
  },
} as CompleteThemeSettings;

describe('getShadowValue', () => {
  it('returns "none" when widgetStyleOptions is undefined', () => {
    expect(getShadowValue(undefined, themeSettings)).toBe('none');
  });

  it('returns "none" when widgetStyleOptions does not have shadow property', () => {
    const widgetStyleOptions = { spaceAround: 'Medium' as const };
    expect(getShadowValue(widgetStyleOptions, themeSettings)).toBe('none');
  });

  it('returns "none" when widgetStyleOptions does not have spaceAround property', () => {
    const widgetStyleOptions = { shadow: 'Light' as const };
    expect(getShadowValue(widgetStyleOptions, themeSettings)).toBe('none');
  });

  it('returns the expected shadow value for small space around', () => {
    const widgetStyleOptions = { spaceAround: 'Small' as const };
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Light' }, themeSettings)).toBe(
      '0px 1px 4px rgba(9, 9, 10, 0.15)',
    );
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Medium' }, themeSettings)).toBe(
      '0px 1px 4px rgba(9, 9, 10, 0.3)',
    );
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Dark' }, themeSettings)).toBe(
      '0px 1px 4px rgba(9, 9, 10, 0.7)',
    );
  });

  it('returns the expected shadow value for medium space around', () => {
    const widgetStyleOptions = { spaceAround: 'Medium' as const };
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Light' }, themeSettings)).toBe(
      '0px 2px 8px rgba(9, 9, 10, 0.15)',
    );
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Medium' }, themeSettings)).toBe(
      '0px 2px 8px rgba(9, 9, 10, 0.3)',
    );
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Dark' }, themeSettings)).toBe(
      '0px 2px 8px rgba(9, 9, 10, 0.7)',
    );
  });

  it('returns the expected shadow value for large space around', () => {
    const widgetStyleOptions = { spaceAround: 'Large' as const };
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Light' }, themeSettings)).toBe(
      '0px 3px 12px rgba(9, 9, 10, 0.15)',
    );
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Medium' }, themeSettings)).toBe(
      '0px 3px 12px rgba(9, 9, 10, 0.3)',
    );
    expect(getShadowValue({ ...widgetStyleOptions, shadow: 'Dark' }, themeSettings)).toBe(
      '0px 3px 12px rgba(9, 9, 10, 0.7)',
    );
  });

  it('returns "none" for invalid shadow value', () => {
    const widgetStyleOptions = { shadow: 'invalid' as 'Medium', spaceAround: 'Medium' as const };
    expect(getShadowValue(widgetStyleOptions, themeSettings)).toBe('none');
  });

  it('returns "none" for invalid spaceAround value', () => {
    const widgetStyleOptions = { shadow: 'Dark' as const, spaceAround: 'invalid' as 'Medium' };
    expect(getShadowValue(widgetStyleOptions, themeSettings)).toBe('none');
  });
});
