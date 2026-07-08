import { CSSProperties } from 'react';

import { HeaderItemFill, HeaderItemSize } from './types.js';

/**
 * Default size (in pixels) for a header item dimension that is not specified.
 *
 * Each component can override this with its own default (e.g. the dashboard uses 28px) by passing
 * `defaultSize` to the renderer.
 */
export const DEFAULT_HEADER_ITEM_SIZE = 24;

/**
 * Applies the default-size fallback to a (possibly partial) size.
 *
 * The result is what gets passed to a {@link HeaderItemComponent} via `props.size`.
 */
export const resolveHeaderItemSize = (
  size?: HeaderItemSize,
  defaultSize: number = DEFAULT_HEADER_ITEM_SIZE,
): Required<HeaderItemSize> => ({
  width: size?.width ?? defaultSize,
  height: size?.height ?? defaultSize,
});

/**
 * Maps a resolved size and the internal {@link HeaderItemFill} to the CSS for an item's wrapper.
 *
 * - `fill: 'grow'` → flexible, grows to fill the row (the center spacer).
 * - `fill: 'truncate'` → natural content width, shrinkable (the title — enables ellipsis).
 * - `fill: 'content'` → natural content width, never shrinks (built-in action buttons/menu — so a
 *   long title cannot squeeze and clip their icons).
 * - no `fill` (external items) → fixed pixel `width` (provided or defaulted).
 *
 * `fill` is internal: it is set only on built-in items. External items never carry it, so they are
 * always laid out at a fixed pixel width.
 *
 * `height` is applied as a fixed pixel height (provided or defaulted). Every cell uses
 * `align-items: center`, so an item shorter than the cell is centered vertically;
 */
export const getHeaderItemStyle = (
  size: Required<HeaderItemSize>,
  fill?: HeaderItemFill,
): CSSProperties => {
  const style: CSSProperties = { display: 'flex', alignItems: 'center' };

  if (fill === 'grow') {
    style.flex = '1 1 auto';
    style.minWidth = 0;
  } else if (fill === 'truncate') {
    style.flex = '0 1 auto';
    style.minWidth = 0;
  } else if (fill === 'content') {
    style.flex = '0 0 auto';
  } else {
    // External items: fixed pixel width (resolved size always has a numeric width). Center the
    // content within that fixed box so an item narrower than its width sits centered.
    style.flex = '0 0 auto';
    style.width = `${size.width}px`;
    style.justifyContent = 'center';
  }

  style.height = `${size.height}px`;

  return style;
};
