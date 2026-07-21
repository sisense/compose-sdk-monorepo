/**
 * Relative luminance (0 = black, 1 = white) below which a background color is treated as dark
 * enough that the card's headline text and sparkline should switch to white for contrast.
 * 0.179 is the WCAG crossover point: white text has a higher contrast ratio than black text
 * exactly when the background's relative luminance L satisfies `(1.05) / (L + 0.05) >
 * (L + 0.05) / 0.05`, i.e. below `sqrt(1.05 * 0.05) - 0.05 ~= 0.179`. Mid-gray backgrounds
 * (e.g. `#999999`, luminance ~0.32) therefore keep dark text instead of forcing white at a
 * failing ~2.85:1 ratio.
 * @internal
 */
export const DARK_BACKGROUND_LUMINANCE_THRESHOLD = 0.179;

/** A color's channels, each 0-255 except `a`, which is 0-1. */
type Rgba = { r: number; g: number; b: number; a: number };

/**
 * Parses a hex color string (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`) into its channels, or
 * `undefined` when `color` doesn't match a hex color at all (named colors like `'green'`,
 * functional notations like `rgb()`/`hsl()`, or an empty/missing value).
 * @internal
 */
export function parseHexColor(color: string | undefined): Rgba | undefined {
  if (!color) {
    return undefined;
  }
  const match = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(color.trim());
  if (!match) {
    return undefined;
  }

  const hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    const channels = hex.split('').map((digit) => parseInt(digit + digit, 16));
    return {
      r: channels[0],
      g: channels[1],
      b: channels[2],
      a: hex.length === 4 ? channels[3] / 255 : 1,
    };
  }

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

/** Linearizes one sRGB channel (0-255) per the WCAG relative luminance formula. */
function linearizeChannel(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Computes the WCAG relative luminance of a hex color string (0 = black, 1 = white), or
 * `undefined` when the color can't be parsed as hex, or is mostly transparent (alpha below 0.5)
 * -- a mostly-transparent background shows whatever is behind the card, so there's no reliable
 * color to measure contrast against.
 * @internal
 */
export function relativeLuminance(color: string | undefined): number | undefined {
  const rgba = parseHexColor(color);
  if (!rgba || rgba.a < 0.5) {
    return undefined;
  }
  const r = linearizeChannel(rgba.r);
  const g = linearizeChannel(rgba.g);
  const b = linearizeChannel(rgba.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Whether the card's headline text and sparkline should render in white for contrast against
 * `backgroundColor`, instead of forcing white on any custom background regardless of how light
 * it is (the bug this replaces). Only `true` for a background that both parses as a hex color
 * and is dark enough ({@link relativeLuminance} below {@link DARK_BACKGROUND_LUMINANCE_THRESHOLD});
 * an unset, unparseable (named color, `rgb()`/`hsl()`), or mostly transparent background falls
 * back to `false` (the theme's own text color) rather than a guess that could make text invisible.
 * @internal
 */
export function resolveOnColor(backgroundColor: string | undefined): boolean {
  const luminance = relativeLuminance(backgroundColor);
  return luminance !== undefined && luminance < DARK_BACKGROUND_LUMINANCE_THRESHOLD;
}

/**
 * Minimum WCAG contrast ratio for non-text graphics (WCAG 1.4.11), used to decide whether the
 * theme's accent color is legible for the sparkline against a custom card background.
 * @internal
 */
export const GRAPHICS_MIN_CONTRAST_RATIO = 3;

/**
 * Computes the WCAG contrast ratio (1-21) between two hex colors, or `undefined` when either
 * color can't be measured ({@link relativeLuminance} returns `undefined` for it).
 * @internal
 */
export function contrastRatio(a: string | undefined, b: string | undefined): number | undefined {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === undefined || lb === undefined) {
    return undefined;
  }
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Resolves the sparkline color against a custom card background: keeps the theme `accent` when
 * it is legible (contrast ratio of at least {@link GRAPHICS_MIN_CONTRAST_RATIO}, per WCAG 1.4.11
 * for graphics), and otherwise falls back to whichever of the theme `textColor` or white reads
 * better against the background. With no custom background -- or one that can't be measured
 * (named color, `rgb()`, mostly transparent) -- the accent is returned unchanged, matching the
 * text behavior of {@link resolveOnColor}.
 * @internal
 */
export function resolveSparklineColor(options: {
  accent: string;
  textColor: string;
  backgroundColor: string | undefined;
}): string {
  const { accent, textColor, backgroundColor } = options;
  const accentContrast = contrastRatio(accent, backgroundColor);
  if (accentContrast === undefined || accentContrast >= GRAPHICS_MIN_CONTRAST_RATIO) {
    return accent;
  }
  const textContrast = contrastRatio(textColor, backgroundColor) ?? 0;
  const whiteContrast = contrastRatio('#ffffff', backgroundColor) ?? 0;
  return textContrast >= whiteContrast ? textColor : '#ffffff';
}
