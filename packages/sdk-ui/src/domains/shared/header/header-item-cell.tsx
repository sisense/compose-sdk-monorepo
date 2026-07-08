import styled from '@emotion/styled';

import { getHeaderItemStyle, resolveHeaderItemSize } from './header-item-size.js';
import { ResolvedHeaderItem } from './types.js';

/**
 * The cell box wrapping the item's content.
 */
const CellBox = styled.div``;

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
 */
export const HeaderItemCell = ({ item, defaultSize }: HeaderItemCellProps) => {
  const size = resolveHeaderItemSize(item.size, defaultSize);
  return (
    <CellBox data-testid={`header-item-${item.id}`} style={getHeaderItemStyle(size, item.fill)}>
      {item.component({ size })}
    </CellBox>
  );
};
