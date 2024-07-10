import Color from 'colorjs.io';

export const TRIANGLE_COLOR_ADJUSTMENT = 0.15;

export type ColorArg = string | Color;

export const toColor = (color: ColorArg): Color =>
  typeof color === 'string' ? new Color(color) : color;

export const toString = (color: Color) => color.toString({ format: 'hex' });

export const toRangeFn = (...colorArgs: ColorArg[]): ((percentage: number) => string) => {
  const colors = colorArgs.map(toColor);
  if (colors.length < 2) {
    return () => toString(colors[0]);
  }
  const colorPairs = colors.slice(0, -1).map((color, index) => [color, colors[index + 1]]);
  const ranges = colorPairs.map(([color1, color2]) => {
    const range = Color.range(color1, color2, { outputSpace: 'srgb' });
    return (percentage: number) => toString(range(percentage) as unknown as Color);
  });

  return (percentage: number) => {
    if (percentage <= 0) return toString(colors[0]);
    if (percentage >= 1) return toString(colors[colors.length - 1]);

    const rangeIndex = Math.floor(percentage * ranges.length);
    return ranges[rangeIndex](percentage * ranges.length - rangeIndex);
  };
};

export const toSteps = (numSteps: number, ...colorArgs: ColorArg[]) => {
  const colors = colorArgs.map(toColor);
  if (colors.length < 2) {
    return Array<string>(numSteps).fill(toString(colors[0]));
  }

  const rangeFn = toRangeFn(...colors);
  return Array(numSteps)
    .fill(0)
    .map((_, index) => rangeFn(index / (numSteps - 1)));
};

export const toGray = (color: ColorArg) => toString(toColor(color).set('hsl.s', 0));

export const toAvg = (color1: ColorArg, color2: ColorArg) =>
  toString(Color.mix(color1, color2, 0.5, { outputSpace: 'srgb' }) as unknown as Color);

export const hueDiff = (color1: ColorArg, color2: ColorArg) =>
  Math.abs(toColor(color2).hsl.h - toColor(color1).hsl.h);

/**
 * Scales the color's brightness by the given percentage.
 *
 * @param colorArg - The color to scale, in any valid color format (e.g., hex, RGB, HSL).
 * @param percent - The percentage by which to scale the color's brightness.
 *                 A positive value will increase the brightness, while a negative value will decrease it.
 *                 The percentage should be a number between -1 and 1, where -1 represents a 100% decrease
 *                 in brightness (i.e., completely black) and 1 represents a 100% increase in brightness
 *                 (i.e., completely white).
 * @returns The scaled color as a string.
 */
export const scaleBrightness = (colorArg: ColorArg, percent: number): string => {
  const color = toColor(colorArg);

  color.hsv.v = color.hsv.v + color.hsv.v * percent;

  if (color.hsv.v > 100) {
    color.hsv.s = color.hsv.s - (color.hsv.v - 100) / 1.677;
  }

  color.hsv.s = Math.max(0, Math.min(100, color.hsv.s));
  color.hsv.v = Math.max(0, Math.min(100, color.hsv.v));

  return toString(color);
};

export const getRgbValuesFromColor = (color: Color) => {
  return {
    R: color.srgb[0] * 255,
    G: color.srgb[1] * 255,
    B: color.srgb[2] * 255,
  };
};

export const getDarkFactor = (color: Color) => {
  const { R, G, B } = getRgbValuesFromColor(color);

  // Counting the perceptive luminance
  // human eye favors green color...
  return 1 - (0.299 * R + 0.587 * G + 0.114 * B) / 255;
};

export function isBright(color: Color) {
  return getDarkFactor(color) < 0.9;
}

export const getSlightlyDifferentColor = (
  colorString: string,
  percent = 0.05,
  opacity = 1,
): string => {
  const color = toColor(colorString);
  const { R, G, B } = getRgbValuesFromColor(color);

  // How dark the color is?
  const darkFactor = getDarkFactor(color);
  let p = percent;
  if (isBright(color)) {
    p *= -0.6;
  }

  // The darker color is, the bigger percent we need to see the difference,
  // I.E rgb(255,255,255) vs rgb(240,240,240) - a visible changes, while
  // rbg(0,0,0) vs rgb(15,15,15) - absolutely no difference
  p *= Math.exp(darkFactor * 1.2);

  const newR = Math.min(Math.max(Math.round(255 * p) + R, 0), 255);
  const newG = Math.min(Math.max(Math.round(255 * p) + G, 0), 255);
  const newB = Math.min(Math.max(Math.round(255 * p) + B, 0), 255);

  return `rgba(${newR}, ${newG}, ${newB}, ${opacity})`;
};

/**
 * Applies opacity to a color
 *
 * @param color - color to apply opacity to
 * @param opacity - opacity to apply (from 0 to 1)
 * @returns - color with opacity applied
 */
export const applyOpacity = (color: string, opacity: number) => {
  const colorObj = toColor(color);
  colorObj.alpha = opacity;
  return toString(colorObj);
};
