import { describe, expect, it } from 'vitest';

import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';
import { convertToThemeSettings } from '@/infra/themes/legacy-design-settings';
import type { LegacyDesignSettings, LegacyPalette } from '@/infra/themes/legacy-design-settings';

import {
  FIELD_BORDER_TINT,
  FIELD_SURFACE_TINT,
  filterWidgetThemeColors,
  filterWidgetThemeColorsFromDesignSettings,
  getFilterWidgetControlDefaults,
  resolveFilterWidgetPalette,
} from './filter-widget-theme';

/**
 * The two themes the controls have to look right in: the product's own default, whose values
 * the control design was authored against, and a dark theme, which is where every frozen
 * light-grey constant used to show.
 */
const SISENSE_DEFAULT = {
  dashboards: {
    widgetTextColor: '#131f29',
    widgetSecondaryTextColor: '#666666',
    widgetBackgroundColor: '#FFFFFF',
  },
  typography: {
    hyperlinkColor: '#1FAFF3',
    hyperlinkHoverColor: '#1cd5dc',
    fontFamily: 'Open Sans',
  },
  general: {
    brandColor: '#94F5F0',
    primaryButtonHoverColor: '#1cd5dc',
    primaryButtonTextColor: '#3a4356',
    secondaryButtonBaseColor: '#edeef1',
    secondaryButtonHoverColor: '#d0d3db',
    secondaryButtonTextColor: '#3a4356',
  },
} as const;

const DARK = {
  dashboards: {
    widgetTextColor: '#FFFFFF',
    widgetSecondaryTextColor: '#C5C8CF',
    widgetBackgroundColor: '#313138',
  },
  typography: {
    hyperlinkColor: '#7FD4FF',
    hyperlinkHoverColor: '#FFE066',
    fontFamily: 'Open Sans',
  },
  general: {
    brandColor: '#FFCB05',
    primaryButtonHoverColor: '#F2B900',
    primaryButtonTextColor: '#3A4356',
    secondaryButtonBaseColor: '#EDEEF1',
    secondaryButtonHoverColor: '#D0D3DB',
    secondaryButtonTextColor: '#3A4356',
  },
} as const;

/** Builds a resolved theme the way a Fusion instance's design settings would. */
function themeFrom(source: typeof SISENSE_DEFAULT | typeof DARK) {
  const shell = getLegacyShell();
  const legacy = {
    ...shell,
    dashboards: { ...shell.dashboards, ...source.dashboards },
    typography: { ...shell.typography, ...source.typography },
    general: { ...shell.general, ...source.general },
  } as unknown as LegacyDesignSettings;

  return convertToThemeSettings(
    legacy,
    { colors: ['#00cee6'] } as LegacyPalette,
    'http://localhost/',
  );
}

/** The fields `convertToThemeSettings` reads but this suite does not vary. */
function getLegacyShell() {
  return {
    oid: 'test',
    dashboards: {
      toolbarBackgroundColor: '#fff',
      toolbarSecondaryTextColor: '#666',
      toolbarTextColor: '#131f29',
      colorPaletteName: 'Vivid',
      navBackgroundColor: '#fff',
      navTextColor: '#5B6372',
      navTextHoverColor: '#3A4356',
      navHoverBackgroundColor: '#F4F4F8',
      panelBackgroundColor: '#F6F6F6',
      panelTitleTextColor: '#131f29',
      widgetTitleBackgroundColor: '#FFFFFF',
      widgetTitleColor: '#131f29',
      widgetTitleAlignment: 'left',
      widgetSecondaryTitleColor: '#666666',
      widgetTitleDividerEnabled: false,
      widgetTitleDividerColor: '#5B6372',
      widgetBorderEnabled: false,
      widgetBorderColor: '#9EA2AB',
      widgetCornerRadius: 'none',
      widgetShadow: 'none',
      widgetSpacing: 'none',
      layoutBackgroundColor: '#FFFFFF',
    },
    typography: {
      customFontSelected: false,
      predefinedFont: 'Open Sans',
      hyperlinkHoverColor: '#1cd5dc',
      primaryTextColor: '#131f29',
      secondaryTextColor: '#666666',
    },
    general: { backgroundColor: '#ffffff' },
  };
}

describe('filterWidgetThemeColors', () => {
  it.each([
    ['Sisense Default', SISENSE_DEFAULT],
    ['dark', DARK],
  ])('reads the widget colours out of the %s theme', (_name, source) => {
    const colors = filterWidgetThemeColors(themeFrom(source));

    expect(colors.widgetBackground).toBe(source.dashboards.widgetBackgroundColor);
    expect(colors.widgetPrimaryText).toBe(source.dashboards.widgetTextColor);
    expect(colors.widgetSecondaryText).toBe(source.dashboards.widgetSecondaryTextColor);
    expect(colors.brandColor).toBe(source.general.brandColor);
    expect(colors.hyperlinkColor).toBe(source.typography.hyperlinkColor);
    expect(colors.hyperlinkHoverColor).toBe(source.typography.hyperlinkHoverColor);
    expect(colors.fontFamily).toBe(source.typography.fontFamily);
  });

  it.each([
    ['Sisense Default', SISENSE_DEFAULT],
    ['dark', DARK],
  ])('reads the footer button colours out of the %s theme', (_name, source) => {
    const { buttons } = filterWidgetThemeColors(themeFrom(source));

    expect(buttons.primary.background).toBe(source.general.brandColor);
    expect(buttons.primary.hover).toBe(source.general.primaryButtonHoverColor);
    expect(buttons.primary.text).toBe(source.general.primaryButtonTextColor);
    expect(buttons.cancel.background).toBe(source.general.secondaryButtonBaseColor);
    expect(buttons.cancel.hover).toBe(source.general.secondaryButtonHoverColor);
    expect(buttons.cancel.text).toBe(source.general.secondaryButtonTextColor);
  });

  it('accepts a background stated as one colour for every state', () => {
    const theme = getDefaultThemeSettings();
    theme.general.buttons.cancel.backgroundColor = '#abcdef';

    const { buttons } = filterWidgetThemeColors(theme);

    expect(buttons.cancel.background).toBe('#abcdef');
    expect(buttons.cancel.hover).toBe('#abcdef');
  });
});

describe('resolveFilterWidgetPalette', () => {
  it('paints the Sisense Default theme in the colours the control design was drawn in', () => {
    const palette = resolveFilterWidgetPalette(filterWidgetThemeColors(themeFrom(SISENSE_DEFAULT)));

    expect(palette.bg).toBe('#FFFFFF');
    expect(palette.textPrimary).toBe('#131f29');
    expect(palette.textSecondary).toBe('#666666');
    expect(palette.accent).toBe('#94F5F0');
    expect(palette.border).toBe('#131f2926');
    expect(palette.surfaceMuted).toBe('#131f290a');
  });

  it('follows a dark theme, so nothing is left painting a light constant', () => {
    const colors = filterWidgetThemeColors(themeFrom(DARK));
    const palette = resolveFilterWidgetPalette(colors);

    expect(palette.bg).toBe('#313138');
    expect(palette.panelBg).toBe('#313138');
    expect(palette.textPrimary).toBe('#FFFFFF');
    expect(palette.panelText).toBe('#FFFFFF');
    expect(palette.textSecondary).toBe('#C5C8CF');
    expect(palette.accent).toBe('#FFCB05');
  });

  // The whole point of the tint: a border derived from a frozen dark ink is invisible on a
  // dark surface, so it has to be derived from the ink actually in use.
  it('tints the border and the muted surface from the ink actually in use', () => {
    const dark = resolveFilterWidgetPalette(filterWidgetThemeColors(themeFrom(DARK)));

    expect(dark.border).toBe('#ffffff26');
    expect(dark.surfaceMuted).toBe('#ffffff0a');
    expect(dark.rowHover).toBe(dark.surfaceMuted);
  });

  it('tints from an overridden ink rather than the theme’s', () => {
    const palette = resolveFilterWidgetPalette(filterWidgetThemeColors(themeFrom(DARK)), {
      primaryText: '#000000',
    });

    expect(palette.textPrimary).toBe('#000000');
    expect(palette.border).toBe('#00000026');
    expect(palette.surfaceMuted).toBe('#0000000a');
  });

  it('lets the control’s own style outrank the theme', () => {
    const colors = filterWidgetThemeColors(themeFrom(DARK));
    const palette = resolveFilterWidgetPalette(colors, {
      background: '#123456',
      secondaryText: '#abcabc',
      accentColor: '#ff0000',
      borderColor: '#0000ff',
    });

    expect(palette.bg).toBe('#123456');
    // The panel is the same surface as the fields, so a Filter Style background moves both.
    expect(palette.panelBg).toBe('#123456');
    expect(palette.textSecondary).toBe('#abcabc');
    expect(palette.accent).toBe('#ff0000');
    expect(palette.border).toBe('#0000ff');
  });

  it('keeps the border’s 1px invisible when the style switches it off', () => {
    const palette = resolveFilterWidgetPalette(filterWidgetThemeColors(themeFrom(DARK)), {
      borderEnabled: false,
      borderColor: '#0000ff',
    });

    expect(palette.border).toBe('transparent');
  });

  it('sets the type in the theme’s family, with the design’s stack behind it', () => {
    const palette = resolveFilterWidgetPalette({
      ...filterWidgetThemeColors(themeFrom(DARK)),
      fontFamily: 'Roboto',
    });

    expect(palette.fontFamily).toMatch(/^Roboto, /);
    expect(palette.fontFamily).toContain('sans-serif');
  });

  // Select all / Clear all are hyperlinks, so they take the theme's two hyperlink roles
  // rather than the accent or the primary ink.
  it.each([
    ['Sisense Default', SISENSE_DEFAULT],
    ['dark', DARK],
  ])('paints the links in the %s theme’s hyperlink roles', (_name, source) => {
    const palette = resolveFilterWidgetPalette(filterWidgetThemeColors(themeFrom(source)));

    expect(palette.link).toBe(source.typography.hyperlinkColor);
    expect(palette.linkHover).toBe(source.typography.hyperlinkHoverColor);
  });

  // The Filter Style panel exposes no hyperlink token, so a restyled control must not drag
  // the links away from the theme with it.
  it('keeps the links on the theme when the control is restyled', () => {
    const colors = filterWidgetThemeColors(themeFrom(SISENSE_DEFAULT));
    const palette = resolveFilterWidgetPalette(colors, {
      primaryText: '#000000',
      accentColor: '#ff0000',
    });

    expect(palette.link).toBe(SISENSE_DEFAULT.typography.hyperlinkColor);
    expect(palette.linkHover).toBe(SISENSE_DEFAULT.typography.hyperlinkHoverColor);
  });

  it('keeps the invalid state out of the theme', () => {
    const light = resolveFilterWidgetPalette(filterWidgetThemeColors(themeFrom(SISENSE_DEFAULT)));
    const dark = resolveFilterWidgetPalette(filterWidgetThemeColors(themeFrom(DARK)));

    expect(dark.error).toBe(light.error);
  });
});

describe('getFilterWidgetControlDefaults', () => {
  it.each([
    ['Sisense Default', SISENSE_DEFAULT],
    ['dark', DARK],
  ])('states what a control on the %s theme looks like unstyled', (_name, source) => {
    const defaults = getFilterWidgetControlDefaults(
      filterWidgetThemeColorsFromDesignSettings(source),
    );

    expect(defaults).toEqual({
      primaryText: source.dashboards.widgetTextColor,
      secondaryText: source.dashboards.widgetSecondaryTextColor,
      background: source.dashboards.widgetBackgroundColor,
      borderEnabled: true,
      borderColor: expect.stringContaining(
        source.dashboards.widgetTextColor.toLowerCase().slice(1),
      ),
      accentColor: source.general.brandColor,
    });
  });

  // A design panel compares against these to decide whether a widget still has nothing of
  // its own; if they disagreed with what the control paints, it could never tell.
  it('agrees with the palette the control paints with', () => {
    const colors = filterWidgetThemeColors(themeFrom(DARK));
    const defaults = getFilterWidgetControlDefaults(colors);
    const palette = resolveFilterWidgetPalette(colors);

    expect(defaults.primaryText).toBe(palette.textPrimary);
    expect(defaults.secondaryText).toBe(palette.textSecondary);
    expect(defaults.background).toBe(palette.bg);
    expect(defaults.borderColor).toBe(palette.border);
    expect(defaults.accentColor).toBe(palette.accent);
  });

  it('is reproduced by resolving the defaults back into a palette', () => {
    const colors = filterWidgetThemeColors(themeFrom(SISENSE_DEFAULT));
    const fromDefaults = resolveFilterWidgetPalette(colors, getFilterWidgetControlDefaults(colors));

    expect(fromDefaults).toEqual(resolveFilterWidgetPalette(colors));
  });
});

describe('tint ratios', () => {
  // The panel and the controls both quote these; a change here is a visual change everywhere.
  it('are the ones the control design states', () => {
    expect(FIELD_BORDER_TINT).toBe(0.15);
    expect(FIELD_SURFACE_TINT).toBe(0.04);
  });
});
