import styled from '@emotion/styled';

import { getHeaderItemStyle, resolveHeaderItemSize } from './header-item-size.js';
import { HeaderItemComponent, HeaderItemSize, ResolvedHeaderItem } from './types.js';

const HeaderItemsRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
`;

/**
 * Renders a single header item's component inside its own fiber, so the component may safely use
 * hooks. Each cell is keyed by item id (via the wrapper), so toggling items mounts/unmounts whole
 * cells instead of shifting hook order within a shared component.
 */
const HeaderItemCell = ({
  component,
  size,
}: {
  component: HeaderItemComponent;
  size: Required<HeaderItemSize>;
}) => <>{component({ size })}</>;

/**
 * Props for {@link HeaderItemsRenderer}.
 *
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
}

/**
 * Renders a resolved list of header items as a single horizontal flex row.
 */
export const HeaderItemsRenderer = ({ items, defaultSize }: HeaderItemsRendererProps) => {
  return (
    <HeaderItemsRow data-testid="header-items-row">
      {items.map((item) => {
        const size = resolveHeaderItemSize(item.size, defaultSize);
        return (
          <div
            key={item.id}
            data-header-item-id={item.id}
            style={getHeaderItemStyle(size, item.fill)}
          >
            <HeaderItemCell component={item.component} size={size} />
          </div>
        );
      })}
    </HeaderItemsRow>
  );
};
