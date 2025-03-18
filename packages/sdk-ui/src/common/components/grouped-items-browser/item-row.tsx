/* eslint-disable @typescript-eslint/unbound-method */
import styled from '@emotion/styled';
import ListItemButton from '@mui/material/ListItemButton';
import React from 'react';

import { Item, ItemActionConfig, ItemSecondaryActionConfig } from './types';

/**
 * Props for the item row component.
 */
type ItemRowProps = {
  /** The item to display. */
  item: Item;
  /** The action to perform when the item is clicked. */
  itemActionConfig?: ItemActionConfig;
  /** The secondary action of the item. */
  itemSecondaryActionConfig?: ItemSecondaryActionConfig;
};

const ItemRowContent = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-left: 48px;
`;

const ItemRowTitle = styled.div`
  display: flex;
  align-items: center;
`;

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  itemActionConfig,
  itemSecondaryActionConfig,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <ListItemButton
      onClick={() => itemActionConfig?.onClick(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ItemRowContent>
        <ItemRowTitle>
          {item.Icon && <item.Icon />}
          {item.title}
        </ItemRowTitle>
        {itemSecondaryActionConfig && isHovered && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              itemSecondaryActionConfig.onClick(item);
            }}
          >
            <itemSecondaryActionConfig.SecondaryActionButtonIcon item={item} />
          </div>
        )}
      </ItemRowContent>
    </ListItemButton>
  );
};
