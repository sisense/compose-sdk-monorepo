import { ReactNode } from 'react';

import styled from '@emotion/styled';

import { getHeaderItemStyle, resolveHeaderItemSize } from './header-item-size.js';
import { ResolvedHeaderItem } from './types.js';

/**
 * The cell box wrapping the item's content.
 */
const CellBox = styled.div``;

/**
 * Whether the item's component drew nothing for this render.
 *
 * A cell with no content is pure layout — the spacers are the built-in case, and a conditional item
 * that currently renders `null` is the same thing. Such a cell still occupies width (a spacer
 * absorbs all of it), so it must never become a pointer target: a header laid over the component's
 * body would otherwise swallow clicks meant for the content underneath.
 */
const isEmptyContent = (content: ReactNode): boolean =>
  content === null || content === undefined || content === false || content === '';

/**
 * Props for {@link HeaderItemCell}.
 */
export interface HeaderItemCellProps {
  /** The resolved header item to render. */
  item: ResolvedHeaderItem;
  /**
   * Default size (px) applied when the item doesn't specify one, letting each host pick its own
   * default (the dashboard uses 28). Defaults to {@link DEFAULT_HEADER_ITEM_SIZE}.
   */
  defaultSize?: number;
}

/**
 * Renders a single header item.
 *
 * This is the **header item component** every item flows through: it owns the item's layout box —
 * the width behavior (from the internal `fill`), the orchestrator-provided height, and centering the
 * content on both axes — so individual items only render their content and never manage header
 * alignment themselves.
 *
 * An item shorter than the cell height is centered vertically; an item taller than the default grows
 * its cell (and, via the row's `align-items: center`, the whole header) while staying centered.
 *
 * The cell also declares whether it is a pointer target: cells that drew content take pointer events,
 * empty ones (spacers) do not. Both are explicit so that a host rendering its header as an overlay
 * can turn off pointer events for the whole strip and have the interactive items opt back in.
 */
export const HeaderItemCell = ({ item, defaultSize }: HeaderItemCellProps) => {
  const size = resolveHeaderItemSize(item.size, defaultSize);
  const content = item.component({ size });
  return (
    <CellBox
      data-testid={`header-item-${item.id}`}
      style={{
        ...getHeaderItemStyle(size, item.fill),
        pointerEvents: isEmptyContent(content) ? 'none' : 'auto',
      }}
    >
      {content}
    </CellBox>
  );
};
