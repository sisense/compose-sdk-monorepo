/**
 * Fits a list of chosen values into the width a trigger actually has.
 *
 * The rule is the designer's: name as many values as fit, then `+N` for the rest, and always
 * name at least one — a trigger reading only `+3` would have hidden the very thing it filters
 * on. What changed is how "fit" is decided. A character budget derived from the 188px control
 * cannot answer it, because the same control is full-width inside the filter widget, where the
 * box is 338px and the budget was truncating after two short values.
 * @internal
 */

/** Measures a string as the trigger would render it. @internal */
export type MeasureText = (text: string) => number;

/** @internal */
export type FittedNames = {
  /** The names to show, already joined. */
  text: string;
  /** How many did not fit. Zero when they all did. */
  hidden: number;
};

/**
 * Chooses how many values a box of `availableWidth` can name.
 *
 * The pill is measured as part of the candidate, because it takes room from the same box: a
 * fit that ignores it produces names that push the count out of view.
 * @param labels - Titles of the chosen values, in the order they should be named
 * @param availableWidth - Pixels the names and the pill share
 * @param measure - Measures a candidate string in those same pixels
 * @returns The names to render, and how many are hidden behind the count
 * @internal
 */
export function fitNames(
  labels: readonly string[],
  availableWidth: number,
  measure: MeasureText,
): FittedNames {
  if (labels.length === 0) {
    return { text: '', hidden: 0 };
  }

  let shown = labels.length;
  while (shown > 1) {
    const hidden = labels.length - shown;
    const candidate = labels.slice(0, shown).join(', ') + (hidden > 0 ? ` +${hidden}` : '');
    if (measure(candidate) <= availableWidth) {
      break;
    }
    shown -= 1;
  }

  return { text: labels.slice(0, shown).join(', '), hidden: labels.length - shown };
}

/**
 * Builds a measurer for a font, backed by one shared canvas.
 *
 * A canvas rather than a hidden DOM node: measuring text is what `measureText` is for, it
 * needs no layout pass, and one context serves every control on the page.
 * @param font - A CSS `font` shorthand, as `getComputedStyle` reports it
 * @returns A measurer, or null where canvas is unavailable (jsdom, SSR)
 * @internal
 */
export function createTextMeasurer(font: string): MeasureText | null {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) {
    return null;
  }
  context.font = font;
  return (text: string) => context.measureText(text).width;
}
