/* eslint-disable @typescript-eslint/unbound-method */
import React, { ReactElement } from 'react';

import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';

import { Item, ItemActionConfig, ItemSecondaryActionConfig } from './types.js';

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
`;

const ItemRowTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.1px;
`;

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  itemActionConfig,
  itemSecondaryActionConfig,
}) => {
  const { themeSettings } = useThemeContext();
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <ItemRowTooltip isDisabled={item.isDisabled} hoverTooltip={item.hoverTooltip}>
      <ItemRowButton
        onClick={() => itemActionConfig?.onClick(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        theme={themeSettings}
        disabled={item.isDisabled}
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
      </ItemRowButton>
    </ItemRowTooltip>
  );
};

const ItemRowButton = styled(ListItemButton)<Themable>`
  display: flex;
  padding: 0px 8px 0px 40px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  height: 28px;

  color: ${({ theme }) => theme.general.popover.content.clickableList.item.textColor};
  background: ${({ theme }) => theme.general.popover.content.clickableList.item.backgroundColor};

  &:hover {
    background: ${({ theme }) =>
      theme.general.popover.content.clickableList.item.hover.backgroundColor};
    color: ${({ theme }) => theme.general.popover.content.clickableList.item.hover.textColor};
  }

  svg path {
    fill: ${({ theme }) => theme.general.popover.content.clickableList.item.textColor};
    &:hover {
      fill: ${({ theme }) => theme.general.popover.content.clickableList.item.hover.textColor};
    }
  }
`;

const ItemRowTooltip = ({
  isDisabled,
  hoverTooltip,
  children,
}: {
  isDisabled?: boolean;
  hoverTooltip?: string;
  children: ReactElement;
}) => {
  if (hoverTooltip) {
    if (isDisabled) {
      return (
        <Tooltip title={hoverTooltip} placement="top" arrow>
          <span>{children}</span>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={hoverTooltip} placement="top" arrow>
        {children}
      </Tooltip>
    );
  }
  return children;
};
