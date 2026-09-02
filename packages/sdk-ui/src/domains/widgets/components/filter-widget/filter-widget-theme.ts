/**
 * How the filter widget's controls take their colour from the dashboard theme.
 *
 * The controls are drawn from a design whose palette was authored against the product's
 * own default theme, so every colour in it has a theme role that means the same thing.
 * This module states that correspondence once: {@link filterWidgetThemeColors} names the
 * roles a control needs, {@link resolveFilterWidgetPalette} turns them into the colours
 * the styles paint with, and {@link getFilterWidgetControlDefaults} answers the narrower
 * question a design panel asks — "what would this control look like if the reader changed
 * nothing?".
 *
 * A control follows the theme for colour and the design panel for shape: size, corner
 * radius and placement are steps the theme has no equivalent for, so they stay in
 * `filter-widget-design.ts` as fixed defaults.
 */
import { applyOpacity } from '@/shared/utils/color/color-interpolation';
import type { CompleteThemeSettingsInternal, ElementStateColors } from '@/types';

import type { FilterWidgetControlStyleOptions } from './types';

/**
 * Opacity of the primary ink used for every field border but the invalid one.
 *
 * A tint of the ink rather than a fixed grey, so the border keeps its contrast against
 * a dark surface — where a frozen light-grey line would disappear.
 * @internal
 */
export const FIELD_BORDER_TINT = 0.15;

/**
 * Opacity of the primary ink used for the muted surfaces — a disabled field, a hovered
 * option row, a hovered clear button.
 * @internal
 */
export const FIELD_SURFACE_TINT = 0.04;

/** A border switched off in the design panel still occupies its 1px, invisibly. */
const NO_BORDER = 'transparent';

/**
 * The invalid state's colour. Kept out of the theme on purpose: this is a semantic signal
 * that something is wrong, not a decorative choice, so it should not drift with a brand
 * palette — and no theme role expresses it.
 * @internal
 */
export const FILTER_WIDGET_ERROR_COLOR = '#e74727';

/**
 * Font stack appended behind the theme's own family, so a theme naming a face the browser
 * cannot load still lands on something close to the design's intent.
 */
const FONT_FALLBACKS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

/**
 * The theme roles a filter widget control draws from, named for what they mean to the
 * control rather than for where they sit in a theme.
 *
 * Stated as plain colours rather than as a theme object so that a caller holding the
 * dashboard's design settings in some other shape can supply them too — see
 * {@link filterWidgetThemeColorsFromDesignSettings}.
 * @internal
 */
export type FilterWidgetThemeColors = {
  /** Fills the field, and the panel that drops out of it. */
  widgetBackground: string;
  /** Values and option rows — and the ink both tints are taken from. */
  widgetPrimaryText: string;
  /** Placeholders, disabled text, and every muted glyph: search, chevron, clear, stepper. */
  widgetSecondaryText: string;
  /** The accent: the panel's Apply button. */
  brandColor: string;
  /** Select all / Clear all. */
  hyperlinkColor: string;
  /** Select all / Clear all, pointed at. */
  hyperlinkHoverColor: string;
  /** Type the controls are set in. */
  fontFamily: string;
  /** The drill-in panel's footer buttons. */
  buttons: {
    primary: { background: string; hover: string; text: string };
    cancel: { background: string; hover: string; text: string };
  };
};

/**
 * A themed background is either one colour for every state, or one per state.
 * @param background - The theme's value for a background role
 * @returns The resting and hovered colours
 */
function statefulBackground(background: string | ElementStateColors): {
  background: string;
  hover: string;
} {
  if (typeof background === 'string') {
    return { background, hover: background };
  }
  return { background: background.default, hover: background.hover ?? background.default };
}

/**
 * Reads the control's theme roles out of a resolved theme.
 *
 * The widget colours come from the `chart` group because that is where a dashboard theme
 * carries "the colours a widget's body is drawn in" — the same values the widget container
 * paints its own background from.
 * @param theme - The resolved theme settings
 * @returns The roles a control draws from
 * @internal
 */
export function filterWidgetThemeColors(
  theme: CompleteThemeSettingsInternal,
): FilterWidgetThemeColors {
  const primary = statefulBackground(theme.general.buttons.primary.backgroundColor);
  const cancel = statefulBackground(theme.general.buttons.cancel.backgroundColor);

  return {
    widgetBackground: theme.chart.backgroundColor,
    widgetPrimaryText: theme.chart.textColor,
    widgetSecondaryText: theme.chart.secondaryTextColor,
    brandColor: theme.general.brandColor,
    hyperlinkColor: theme.typography.hyperlinkColor,
    hyperlinkHoverColor: theme.typography.hyperlinkHoverColor,
    fontFamily: theme.typography.fontFamily,
    buttons: {
      primary: { ...primary, text: theme.general.buttons.primary.textColor },
      cancel: { ...cancel, text: theme.general.buttons.cancel.textColor },
    },
  };
}

/**
 * The subset of a host's design settings the control's colours are derived from.
 *
 * Structural on purpose: a host holding its own design-settings object can pass it
 * straight in without converting to a full theme first.
 * @sisenseInternal
 */
export type FilterWidgetDesignSettingsLike = {
  dashboards: {
    widgetBackgroundColor: string;
    widgetTextColor: string;
    widgetSecondaryTextColor: string;
  };
  general: { brandColor: string };
};

/**
 * Reads the control's colour roles out of a host's design settings.
 *
 * The counterpart to {@link filterWidgetThemeColors} for a caller that holds the
 * dashboard's design settings rather than a resolved theme — a design panel, for
 * instance, deciding what to show for a control nobody has restyled.
 * @param designSettings - The host's design settings
 * @returns The colour roles a control draws from
 * @sisenseInternal
 */
export function filterWidgetThemeColorsFromDesignSettings(
  designSettings: FilterWidgetDesignSettingsLike,
): Pick<
  FilterWidgetThemeColors,
  'widgetBackground' | 'widgetPrimaryText' | 'widgetSecondaryText' | 'brandColor'
> {
  return {
    widgetBackground: designSettings.dashboards.widgetBackgroundColor,
    widgetPrimaryText: designSettings.dashboards.widgetTextColor,
    widgetSecondaryText: designSettings.dashboards.widgetSecondaryTextColor,
    brandColor: designSettings.general.brandColor,
  };
}

/**
 * The colour half of a control's style — the tokens a design panel offers.
 * @sisenseInternal
 */
export type FilterWidgetControlColorDefaults = Required<
  Pick<
    FilterWidgetControlStyleOptions,
    'primaryText' | 'secondaryText' | 'background' | 'borderEnabled' | 'borderColor' | 'accentColor'
  >
>;

/**
 * What a control looks like when nothing has been restyled: the theme's own colours.
 *
 * A design panel needs exactly this — to show the reader where each control starts, and to
 * recognise the moment a control is back at that starting point and its stored style can be
 * dropped so the control follows the theme again.
 * @param colors - The control's colour roles, from the theme or the host's design settings
 * @returns Every colour token filled in from the theme
 * @example
 * ```ts
 * getFilterWidgetControlDefaults(
 *   filterWidgetThemeColorsFromDesignSettings(designSettings),
 * );
 * ```
 * @sisenseInternal
 */
export function getFilterWidgetControlDefaults(
  colors: Pick<
    FilterWidgetThemeColors,
    'widgetBackground' | 'widgetPrimaryText' | 'widgetSecondaryText' | 'brandColor'
  >,
): FilterWidgetControlColorDefaults {
  return {
    primaryText: colors.widgetPrimaryText,
    secondaryText: colors.widgetSecondaryText,
    background: colors.widgetBackground,
    borderEnabled: true,
    borderColor: applyOpacity(colors.widgetPrimaryText, FIELD_BORDER_TINT),
    accentColor: colors.brandColor,
  };
}

/** The colour a control's own style may override, all optional. @internal */
export type FilterWidgetControlColorOverrides = Partial<FilterWidgetControlColorDefaults>;

/** Every colour role a control's styles paint with. @internal */
export type FilterWidgetPalette = {
  bg: string;
  textPrimary: string;
  textSecondary: string;
  textLabel: string;
  border: string;
  surfaceMuted: string;
  accent: string;
  error: string;
  link: string;
  linkHover: string;
  panelBg: string;
  panelText: string;
  rowHover: string;
  fontFamily: string;
  /** Fills the drill-in panel's Apply button — the theme's primary button, not the accent. */
  buttonPrimaryBg: string;
  buttonPrimaryHover: string;
  buttonPrimaryText: string;
  buttonCancelBg: string;
  buttonCancelHover: string;
  buttonCancelText: string;
};

/**
 * Resolves what a control paints with: its own style first, the theme behind it.
 *
 * There is no third layer. A theme always has a value for every role it expresses, so a
 * design constant behind it could never be reached — which is the point: the design's
 * palette IS the default theme's, so following the theme reproduces the design wherever
 * nobody changed it, and follows the reader wherever they did.
 *
 * Both tints are taken from the *resolved* primary ink rather than the theme's, so a
 * control whose text colour was overridden keeps a border and a hover that belong to it.
 * @param colors - The control's colour roles, read from the theme
 * @param overrides - The control's own style, if it has one
 * @returns Every colour role, filled in
 * @internal
 */
export function resolveFilterWidgetPalette(
  colors: FilterWidgetThemeColors,
  overrides: FilterWidgetControlColorOverrides = {},
): FilterWidgetPalette {
  const textPrimary = overrides.primaryText || colors.widgetPrimaryText;
  const textSecondary = overrides.secondaryText || colors.widgetSecondaryText;
  const background = overrides.background || colors.widgetBackground;
  const surfaceMuted = applyOpacity(textPrimary, FIELD_SURFACE_TINT);

  return {
    bg: background,
    textPrimary,
    textSecondary,
    /* The design names the field label with its own ink token, which predates theming and
       was chosen to read as the primary ink; under a theme, that is what the primary ink is. */
    textLabel: textPrimary,
    border:
      overrides.borderEnabled === false
        ? NO_BORDER
        : overrides.borderColor || applyOpacity(textPrimary, FIELD_BORDER_TINT),
    surfaceMuted,
    accent: overrides.accentColor || colors.brandColor,
    error: FILTER_WIDGET_ERROR_COLOR,
    link: colors.hyperlinkColor,
    linkHover: colors.hyperlinkHoverColor,
    /* The same fill as the fields, per the designer's control library: the panel and the
       dropdowns on it are one surface, not two contrasting ones. */
    panelBg: background,
    panelText: textPrimary,
    rowHover: surfaceMuted,
    fontFamily: `${colors.fontFamily}, ${FONT_FALLBACKS}`,
    /* `accent` is the Apply button's fill, so only its hover and label are needed here. The
       hover stays the theme's even when the accent was overridden, matching how every other
       role resolves independently. */
    buttonPrimaryBg: colors.buttons.primary.background,
    buttonPrimaryHover: colors.buttons.primary.hover,
    buttonPrimaryText: colors.buttons.primary.text,
    buttonCancelBg: colors.buttons.cancel.background,
    buttonCancelHover: colors.buttons.cancel.hover,
    buttonCancelText: colors.buttons.cancel.text,
  };
}
