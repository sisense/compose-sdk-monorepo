/**
 * Colour for the filter widget controls.
 *
 * Every colour a control paints with comes from the dashboard theme, overridden by the
 * widget's own style where it has one. The correspondence between a theme role and a
 * control's colour lives in `../filter-widget-theme.ts`; this module is only the bridge
 * from React's theme context to it, plus the custom properties the styles read.
 *
 * The palette reaches the styled components as CSS custom properties rather than props:
 * `Field` puts them on its root through {@link fieldPaletteVars}, and every style reads
 * `var(--csdk-fw-*, <fallback>)`. That keeps the styles static and free of prop plumbing,
 * and the fallback means a piece rendered outside a `Field` — a panel in a portal — still
 * paints something sane.
 * @internal
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import {
  DEFAULT_HYPERLINK_COLOR,
  DEFAULT_HYPERLINK_HOVER_COLOR,
} from '@/infra/contexts/theme-provider/default-theme-settings';
import { applyOpacity } from '@/shared/utils/color/color-interpolation';

import {
  FIELD_BORDER_TINT,
  FIELD_SURFACE_TINT,
  FILTER_WIDGET_ERROR_COLOR,
  type FilterWidgetPalette,
  filterWidgetThemeColors,
  resolveFilterWidgetPalette,
} from '../filter-widget-theme';
import type { FilterWidgetControlStyleOptions } from '../types';

/** @internal */
export type FieldPalette = FilterWidgetPalette;

/**
 * The colour knobs of the widget's Filter Style design panel — the colour half of
 * {@link FilterWidgetControlStyleOptions}, whose token names this shares so the panel, the
 * props and the controls all name a colour the same way. Size and radius travel as their own
 * props, since a field takes them as steps rather than as colours.
 *
 * Every field is optional, and an omitted one falls through to the dashboard theme, which is
 * also what the panel's "Restore default styling" produces.
 * @internal
 */
export type FilterControlStyle = Pick<
  FilterWidgetControlStyleOptions,
  'primaryText' | 'secondaryText' | 'background' | 'borderEnabled' | 'borderColor' | 'accentColor'
>;

/** Custom property each palette role is published under. @internal */
const VAR = {
  bg: '--csdk-fw-bg',
  textPrimary: '--csdk-fw-text-primary',
  textSecondary: '--csdk-fw-text-secondary',
  textLabel: '--csdk-fw-text-label',
  border: '--csdk-fw-border',
  surfaceMuted: '--csdk-fw-surface-muted',
  accent: '--csdk-fw-accent',
  error: '--csdk-fw-error',
  link: '--csdk-fw-link',
  linkHover: '--csdk-fw-link-hover',
  panelBg: '--csdk-fw-panel-bg',
  panelText: '--csdk-fw-panel-text',
  rowHover: '--csdk-fw-row-hover',
  fontFamily: '--csdk-fw-font-family',
  buttonPrimaryBg: '--csdk-fw-button-primary-bg',
  buttonPrimaryHover: '--csdk-fw-button-primary-hover',
  buttonPrimaryText: '--csdk-fw-button-primary-text',
  buttonCancelBg: '--csdk-fw-button-cancel-bg',
  buttonCancelHover: '--csdk-fw-button-cancel-hover',
  buttonCancelText: '--csdk-fw-button-cancel-text',
} as const satisfies Record<keyof FieldPalette, string>;

/**
 * The design's own inks — the Sisense Default L&F palette, which is what the controls were
 * drawn against.
 */
const DESIGN_INK = '#131f29';
const DESIGN_BG = '#ffffff';

/**
 * What a style falls back to when it is rendered outside a `Field` and so inherits none of
 * the custom properties, so a detached piece looks like the design rather than like nothing.
 *
 * Inside a `Field` these are never reached: the root always publishes a resolved value for
 * every role. The tints and the invalid colour are computed from the same constants the
 * resolver uses, so a change to a tint ratio cannot leave the fallback behind.
 * @internal
 */
export const fwFallback: Record<keyof FieldPalette, string> = {
  bg: DESIGN_BG,
  textPrimary: DESIGN_INK,
  textSecondary: '#666666',
  textLabel: DESIGN_INK,
  border: applyOpacity(DESIGN_INK, FIELD_BORDER_TINT),
  surfaceMuted: applyOpacity(DESIGN_INK, FIELD_SURFACE_TINT),
  accent: '#94f5f0',
  error: FILTER_WIDGET_ERROR_COLOR,
  link: DEFAULT_HYPERLINK_COLOR,
  linkHover: DEFAULT_HYPERLINK_HOVER_COLOR,
  panelBg: DESIGN_BG,
  panelText: DESIGN_INK,
  rowHover: applyOpacity(DESIGN_INK, FIELD_SURFACE_TINT),
  fontFamily:
    "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  buttonPrimaryBg: '#94f5f0',
  buttonPrimaryHover: '#1cd5dc',
  buttonPrimaryText: '#3a4356',
  buttonCancelBg: '#edeef1',
  buttonCancelHover: '#d0d3db',
  buttonCancelText: '#3a4356',
};

/** Main Shadow. @internal */
export const fwFieldShadow = '0 0 5px rgba(58, 67, 86, 0.2)';

/** Reads a palette role in a style, falling back to the default theme's value. @internal */
export const fwVar = (role: keyof FieldPalette, fallback: string) =>
  `var(${VAR[role]}, ${fallback})`;

/**
 * Turns a palette into the custom properties the styles read, for the control's root and
 * for each portaled surface — a portal escapes the root and would inherit none of them.
 *
 * These are an implementation detail, not a styling interface: the control is styled
 * through `styleOptions.control` and the dashboard theme, never by writing to a variable.
 * @param palette - The resolved colour roles
 * @returns The variables, ready to spread onto an element's `style`
 * @internal
 */
export function fieldPaletteVars(palette: FieldPalette): CSSProperties {
  return Object.fromEntries(
    (Object.keys(VAR) as (keyof FieldPalette)[]).map((role) => [VAR[role], palette[role]]),
  );
}

/**
 * Resolves the control palette: the widget's own style wins, then the dashboard theme.
 * @param style - Per-widget overrides from the Filter Style panel, if any
 * @returns The colour roles the controls paint with
 * @internal
 */
export function useFieldPalette(style: FilterControlStyle = {}): FieldPalette {
  const { themeSettings } = useThemeContext();
  /* Keyed on the individual tokens rather than on `style`, because callers pass a fresh
     object literal on every render — depending on its identity would memoize nothing. */
  return useMemo(
    () => resolveFilterWidgetPalette(filterWidgetThemeColors(themeSettings), style),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      themeSettings,
      style.primaryText,
      style.secondaryText,
      style.background,
      style.borderEnabled,
      style.borderColor,
      style.accentColor,
    ],
  );
}
