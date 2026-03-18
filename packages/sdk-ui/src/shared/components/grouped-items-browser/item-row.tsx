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
  align-items: center;
  width: 100%;
  min-width: 0;
`;

const ItemRowTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.1px;
  min-width: 0;
`;

const ItemRowTitleText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemRowActionLabel = styled.span<Themable>`
  font-size: 12px;
  color: ${({ theme }) => theme.general.popover.content.clickableList.item.textColor};
  opacity: 0.85;
  flex-shrink: 0;
`;

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  itemActionConfig,
  itemSecondaryActionConfig,
}) => {
  const { themeSettings } = useThemeContext();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const isEffectiveHover = isHovered || isFocused;
  const actionLabel = (itemActionConfig?.getLabel?.(item) ?? '').trim();

  const handleSecondaryClick = (e: React.MouseEvent) => {
    if (!itemSecondaryActionConfig) {
      return;
    }
    e.stopPropagation();
    if (itemSecondaryActionConfig.keepFocusedOnClick) {
      setIsFocused(true);
    }
    itemSecondaryActionConfig.onClick(
      item,
      e,
      () => itemSecondaryActionConfig.keepFocusedOnClick && setIsFocused(false),
    );
  };

  return (
    <ItemRowTooltip isDisabled={item.isDisabled} hoverTooltip={item.hoverTooltip}>
      <ItemRowButton
        isActivated={isEffectiveHover}
        onClick={() => itemActionConfig?.onClick(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        theme={themeSettings}
        disabled={item.isDisabled}
      >
        <ItemRowContent>
          <ItemRowTitle>
            {item.Icon && <item.Icon />}
            <ItemRowTitleText>{item.title}</ItemRowTitleText>
            {isEffectiveHover && actionLabel && (
              <ItemRowActionLabel theme={themeSettings}>{actionLabel}</ItemRowActionLabel>
            )}
          </ItemRowTitle>
          {itemSecondaryActionConfig && isEffectiveHover && (
            <div onClick={handleSecondaryClick}>
              <itemSecondaryActionConfig.SecondaryActionButtonIcon item={item} />
            </div>
          )}
        </ItemRowContent>
      </ItemRowButton>
    </ItemRowTooltip>
  );
};

type Activatable = { isActivated: boolean };
const ItemRowButton = styled(ListItemButton, {
  shouldForwardProp: (props) => props !== 'isActivated',
})<Themable & Activatable>`
  display: flex;
  padding: 0px 8px 0px 40px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  height: 28px;

  color: ${({ theme }) => theme.general.popover.content.clickableList.item.textColor};
  background: ${({ theme, isActivated }) =>
    isActivated
      ? theme.general.popover.content.clickableList.item.hover.backgroundColor
      : theme.general.popover.content.clickableList.item.backgroundColor};

  &:hover {
    background: ${({ theme }) =>
      theme.general.popover.content.clickableList.item.hover.backgroundColor};
    color: ${({ theme }) => theme.general.popover.content.clickableList.item.hover.textColor};
  }

  svg path {
    fill: ${({ theme, isActivated }) =>
      isActivated
        ? theme.general.popover.content.clickableList.item.hover.textColor
        : theme.general.popover.content.clickableList.item.textColor};
  }
  &:hover svg path {
    fill: ${({ theme }) => theme.general.popover.content.clickableList.item.hover.textColor};
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
