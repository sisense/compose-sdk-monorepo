import type { CSSProperties } from 'react';

import type {
  FilterWidgetControlAlignHorizontal,
  FilterWidgetControlAlignVertical,
  FilterWidgetControlCornerRadius,
  FilterWidgetControlSize,
  FilterWidgetControlStyleOptions,
} from './types';

/**
 * Defines visual parameters shared across FilterWidget filter types.
 * @internal
 */
export const filterWidgetDesign = {
  /** Empty state shown before a dimension is configured (editor / new widget). */
  noDimPlaceholder: {
    color: '#666666',
    title: {
      fontSize: 30,
      fontWeight: 600,
      lineHeight: '36px',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: '24px',
      letterSpacing: '0px',
    },
    gapTitleToSubtitle: 8,
    gapSubtitleToImage: 24,
    imageMaxWidth: 480,
  },
} as const;

/**
 * Shape defaults for {@link FilterWidgetControlStyleOptions} — the steps a control takes
 * when its style says nothing about them.
 *
 * Only the non-colour half: size, corner radius and placement have no theme role to defer
 * to, so a fixed default is the only answer. Colour is resolved against the dashboard theme
 * instead — see `filter-widget-theme.ts` — which is why no colour appears here.
 * @internal
 */
export const FILTER_WIDGET_DESIGN_DEFAULTS: Required<
  Pick<
    FilterWidgetControlStyleOptions,
    'size' | 'cornerRadius' | 'alignHorizontal' | 'alignVertical'
  >
> = {
  size: 's',
  cornerRadius: 's',
  alignHorizontal: 'left',
  alignVertical: 'middle',
};

const SIZE_TOKENS: readonly FilterWidgetControlSize[] = ['xs', 's', 'm', 'l', 'xl'];
const RADIUS_TOKENS: readonly FilterWidgetControlCornerRadius[] = [
  'none',
  'xs',
  's',
  'm',
  'l',
  'xl',
];
const ALIGN_H_TOKENS: readonly FilterWidgetControlAlignHorizontal[] = ['left', 'center', 'right'];
const ALIGN_V_TOKENS: readonly FilterWidgetControlAlignVertical[] = ['top', 'middle', 'bottom'];

function isToken<T extends string>(value: unknown, tokens: readonly T[]): value is T {
  return typeof value === 'string' && (tokens as readonly string[]).includes(value);
}

function justifyForAlign(
  align: FilterWidgetControlAlignHorizontal,
): CSSProperties['justifyContent'] {
  if (align === 'center') return 'center';
  if (align === 'right') return 'flex-end';
  return 'flex-start';
}

function alignItemsForAlign(align: FilterWidgetControlAlignVertical): CSSProperties['alignItems'] {
  if (align === 'top') return 'flex-start';
  if (align === 'bottom') return 'flex-end';
  return 'center';
}

/**
 * Picks known Filter Style keys off a host persistence payload (`style.filterDesign`).
 * Unknown fields are dropped so a future panel revision cannot leak into props.
 * @param raw - Untyped host persistence payload (`style.filterDesign` or equivalent)
 * @returns A partial {@link FilterWidgetControlStyleOptions} when at least one known token is present;
 *   otherwise `undefined`
 * @example
 * ```ts
 * extractFilterWidgetControlStyle({ primaryText: '#111', size: 'l', unknown: true });
 * // → { primaryText: '#111', size: 'l' }
 * ```
 * @internal
 */
export function extractFilterWidgetControlStyle(
  raw: unknown,
): FilterWidgetControlStyleOptions | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }
  const src = raw as Record<string, unknown>;
  const out: FilterWidgetControlStyleOptions = {};

  if (typeof src.primaryText === 'string') out.primaryText = src.primaryText;
  if (typeof src.secondaryText === 'string') out.secondaryText = src.secondaryText;
  if (typeof src.background === 'string') out.background = src.background;
  if (typeof src.borderColor === 'string') out.borderColor = src.borderColor;
  if (typeof src.accentColor === 'string') out.accentColor = src.accentColor;
  if (typeof src.borderEnabled === 'boolean') out.borderEnabled = src.borderEnabled;
  if (isToken(src.size, SIZE_TOKENS)) out.size = src.size;
  if (isToken(src.cornerRadius, RADIUS_TOKENS)) out.cornerRadius = src.cornerRadius;
  if (isToken(src.alignHorizontal, ALIGN_H_TOKENS)) out.alignHorizontal = src.alignHorizontal;
  if (isToken(src.alignVertical, ALIGN_V_TOKENS)) out.alignVertical = src.alignVertical;

  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * A Filter Style statement with every token filled in, and the placement it asks for.
 *
 * Produced by {@link resolveFilterWidgetControlStyle}.
 * @example
 * ```ts
 * const { tokens, containerAlign } = resolveFilterWidgetControlStyle({ size: 'xl' });
 * // tokens.size === 'xl', tokens.cornerRadius === 's' (the default)
 * ```
 * @internal
 */
export type ResolvedFilterWidgetControlStyle = {
  /** The shape defaults, overridden by whatever the style set. */
  tokens: typeof FILTER_WIDGET_DESIGN_DEFAULTS;
  /** Flex placement of the control inside the widget (`alignHorizontal` / `alignVertical`). */
  containerAlign: CSSProperties;
};

/**
 * Resolves a (possibly partial) Filter Style into the control's filled-in shape steps and
 * its placement, replacing any token a host sent as something outside its own set.
 *
 * Shape only. The colours travel to the controls as the style itself, so that a colour the
 * panel never set falls through to the dashboard theme rather than to a constant — see
 * `filter-widget-theme.ts`.
 * @param design - Partial {@link FilterWidgetControlStyleOptions} from props or a host
 *   payload; omitted keys fall back to {@link FILTER_WIDGET_DESIGN_DEFAULTS}
 * @returns The filled-in shape steps and the control's placement
 * @example
 * ```ts
 * const resolved = resolveFilterWidgetControlStyle({ alignHorizontal: 'right' });
 * // resolved.containerAlign.justifyContent === 'flex-end'
 * ```
 * @internal
 */
export function resolveFilterWidgetControlStyle(
  design?: FilterWidgetControlStyleOptions | null,
): ResolvedFilterWidgetControlStyle {
  const merged = {
    ...FILTER_WIDGET_DESIGN_DEFAULTS,
    ...(design?.size !== undefined && { size: design.size }),
    ...(design?.cornerRadius !== undefined && { cornerRadius: design.cornerRadius }),
    ...(design?.alignHorizontal !== undefined && { alignHorizontal: design.alignHorizontal }),
    ...(design?.alignVertical !== undefined && { alignVertical: design.alignVertical }),
  };
  /* Each step is checked against its own token set, because these arrive from a host's
     persisted payload: a step outside the set would reach the controls, index their pixel
     maps with nothing, and leave the field with no height or no radius at all. */
  const alignH = isToken(merged.alignHorizontal, ALIGN_H_TOKENS)
    ? merged.alignHorizontal
    : FILTER_WIDGET_DESIGN_DEFAULTS.alignHorizontal;
  const alignV = isToken(merged.alignVertical, ALIGN_V_TOKENS)
    ? merged.alignVertical
    : FILTER_WIDGET_DESIGN_DEFAULTS.alignVertical;

  return {
    tokens: {
      ...merged,
      size: isToken(merged.size, SIZE_TOKENS) ? merged.size : FILTER_WIDGET_DESIGN_DEFAULTS.size,
      cornerRadius: isToken(merged.cornerRadius, RADIUS_TOKENS)
        ? merged.cornerRadius
        : FILTER_WIDGET_DESIGN_DEFAULTS.cornerRadius,
      alignHorizontal: alignH,
      alignVertical: alignV,
    },
    containerAlign: {
      display: 'flex',
      justifyContent: justifyForAlign(alignH),
      alignItems: alignItemsForAlign(alignV),
      height: '100%',
      width: '100%',
      boxSizing: 'border-box',
    },
  };
}

/**
 * Defines the container metrics for the FilterWidget's
 * 'members' (List) filter type UI.
 *
 * Every dimension variant (text, numeric, datetime) takes its box metrics from this
 * object so the widget renders with identical padding regardless of the selected
 * dimension type. The control fills the container width; the container itself clamps
 * between `minWidth` and `maxWidth`.
 *
 * Colour, size and radius come from {@link resolveFilterWidgetControlStyle} — the Filter
 * Style panel's tokens — which `components/field-palette.ts` resolves against the
 * dashboard theme.
 * @internal
 */
export const membersFilterWidgetDesign = {
  /** Defines the minimum container width in px for all dimension variants. */
  minWidth: 200,
  /** Defines the maximum container width in px for all dimension variants. */
  maxWidth: 400,
  /** Inner padding between the component edge and every row (label, selectors). */
  padding: {
    top: 6,
    right: 8,
    bottom: 8,
    left: 8,
  },
} as const;
