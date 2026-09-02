/**
 * Non-colour foundations for the filter widget controls — type sizes, spacing, shape and
 * the control/panel dimensions — as one object, so an Emotion style reads a size the
 * way it reads a colour. Values are the Filter-widget Figma variables.
 *
 * Colour and the font family live in `field-palette.ts`, because unlike sizes they answer
 * to the dashboard theme.
 * @internal
 */

/**
 * Type scale the controls draw with — the Filter-widget Figma text styles.
 *
 * Sizes only: the family answers to the dashboard theme, so it travels with the colours in
 * `field-palette.ts` rather than sitting here as a constant.
 * @internal
 */
export const typography = {
  label: { size: '13px', lineHeight: '16px', weight: 400, weightAccented: 600 },
  paragraph: { size: '13px', lineHeight: '18px' },
  link: { size: '11px', lineHeight: '16px' },
} as const;

/**
 * Spacing and stroke steps shared by the controls, so a gap is stated once rather than
 * repeated as a literal in each style.
 * @internal
 */
export const spacing = {
  xs: '4px',
  m: '8px',
  borderWidth: '1px',
  iconM: '24px',
  inputGap: '4px',
  inputPaddingY: '2px',
} as const;

/**
 * The Size setting under Look and Feel → Filter Widget Controls.
 *
 * `s` is the default: 28px is today's field and the height the Figma components are
 * drawn at.
 * @internal
 */
export type FieldSize = 'xs' | 's' | 'm' | 'l' | 'xl';

/** Field height per size step. @internal */
export const FIELD_HEIGHT: Record<FieldSize, string> = {
  xs: '24px',
  s: '28px',
  m: '32px',
  l: '36px',
  xl: '40px',
};

/** Horizontal padding rides the size step — xs/s/m 8px, l/xl 12px. @internal */
export const FIELD_PADDING_X: Record<FieldSize, string> = {
  xs: '8px',
  s: '8px',
  m: '8px',
  l: '12px',
  xl: '12px',
};

/**
 * The Corner Radius setting — independent of size, as in the design panel.
 *
 * `s` is the default: 4px is `Input/Base/Corner-Radius`.
 * @internal
 */
export type FieldRadius = 'none' | 'xs' | 's' | 'm' | 'l' | 'xl';

/** Corner radius per step. `xl` is half of the 40px field, so it reads as a pill. @internal */
export const FIELD_RADIUS: Record<FieldRadius, string> = {
  none: '0',
  xs: '2px',
  s: '4px',
  m: '6px',
  l: '8px',
  xl: '20px',
};

/** The overlay under a control. @internal */
export const panel = {
  width: '284px',
  /** Gap between a control and its popover. */
  offset: '4px',
  padding: '16px',
  gap: '12px',
  rowHeight: '30px',
  hintRowHeight: '18px',
} as const;

/** Control widths — each sized for its own longest value, never full-width. @internal */
export const controlWidth = {
  default: '188px',
  date: '140px',
  number: '76px',
} as const;
