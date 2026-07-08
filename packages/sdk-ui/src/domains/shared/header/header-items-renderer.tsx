import styled from '@emotion/styled';

import { HeaderItemCell } from './header-item-cell.js';
import { ResolvedHeaderItem } from './types.js';

const HeaderItemsRow = styled('div', {
  shouldForwardProp: (prop) => prop !== 'gap',
})<{ gap: number }>`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: ${({ gap }) => gap}px;
  overflow-x: auto;
  overflow-y: hidden;
  /* Slim scrollbar so the bar doesn't dominate the header (thin-scrollbar look). */
  scrollbar-width: thin;
  ::-webkit-scrollbar {
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #c2c2c2;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: #7d7d7d;
  }
`;

/**
 * Props for {@link HeaderItemsRenderer}.
 * @internal
 */
export interface HeaderItemsRendererProps {
  /** The resolved, ordered header items to render. */
  items: ResolvedHeaderItem[];
  /**
   * Default size (px) applied to items that don't specify one. Lets each component pick its own
   * default (the dashboard uses 28). Defaults to {@link DEFAULT_HEADER_ITEM_SIZE}.
   */
  defaultSize?: number;
  /**
   * Gap (px) rendered between adjacent header items. Defaults to `0` (no gap); the dashboard uses
   * `10` to match Fusion's spacing.
   */
  gap?: number;
}

/**
 * Renders a resolved list of header items as a single horizontal flex row.
 */
export const HeaderItemsRenderer = ({ items, defaultSize, gap = 0 }: HeaderItemsRendererProps) => {
  return (
    <HeaderItemsRow data-testid="header-items-row" gap={gap}>
      {items.map((item) => (
        <HeaderItemCell key={item.id} item={item} defaultSize={defaultSize} />
      ))}
    </HeaderItemsRow>
  );
};
