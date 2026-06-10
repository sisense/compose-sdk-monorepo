import { DEFAULT_WIDGET_HEADER_HEIGHT } from '@/domains/widgets/constants';
import { CompleteThemeSettingsInternal } from '@/types';

import { getShadowValue, getSpaceAroundPx, getWidgetOverheadHeight } from './widget-style-utils.js';

const themeSettings = {
  widget: {
    shadow: 'None',
    spaceAround: 'None',
  },
} as CompleteThemeSettingsInternal;

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

describe('getSpaceAroundPx', () => {
  it('returns 0 when neither style options nor theme define spacing', () => {
    expect(getSpaceAroundPx(undefined, themeSettings)).toBe(0);
    expect(getSpaceAroundPx({ spaceAround: 'None' }, themeSettings)).toBe(0);
  });

  it('returns the expected pixel value for each spaceAround size', () => {
    expect(getSpaceAroundPx({ spaceAround: 'Small' }, themeSettings)).toBe(5);
    expect(getSpaceAroundPx({ spaceAround: 'Medium' }, themeSettings)).toBe(10);
    expect(getSpaceAroundPx({ spaceAround: 'Large' }, themeSettings)).toBe(15);
  });

  it('falls back to the theme spaceAround when style options omit it', () => {
    const themed = {
      widget: { shadow: 'None', spaceAround: 'Large' },
    } as CompleteThemeSettingsInternal;
    expect(getSpaceAroundPx({}, themed)).toBe(15);
    expect(getSpaceAroundPx(undefined, themed)).toBe(15);
  });
});

describe('getWidgetOverheadHeight', () => {
  it('adds header height and top/bottom padding when the header is visible', () => {
    expect(
      getWidgetOverheadHeight({
        styleOptions: { spaceAround: 'Large' },
        themeSettings,
        hasHeader: true,
      }),
    ).toBe(DEFAULT_WIDGET_HEADER_HEIGHT + 2 * 15);
  });

  it('omits the header height when the header is hidden', () => {
    expect(
      getWidgetOverheadHeight({
        styleOptions: { spaceAround: 'Large' },
        themeSettings,
        hasHeader: false,
      }),
    ).toBe(2 * 15);
  });

  it('returns only the header height when there is no spacing', () => {
    expect(
      getWidgetOverheadHeight({
        styleOptions: { spaceAround: 'None' },
        themeSettings,
        hasHeader: true,
      }),
    ).toBe(DEFAULT_WIDGET_HEADER_HEIGHT);
  });

  it('returns 0 when the header is hidden and there is no spacing', () => {
    expect(
      getWidgetOverheadHeight({ styleOptions: undefined, themeSettings, hasHeader: false }),
    ).toBe(0);
  });
});
