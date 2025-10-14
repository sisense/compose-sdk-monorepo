import { useCallback, useState } from 'react';

import styled from '@emotion/styled';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

import { ArrowIcon } from '@/common/icons/arrow-icon';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';

import { GroupSecondaryActionConfig, ItemsGroup } from './types';

type GroupHeaderProps = {
  isOpen: boolean;
  group: ItemsGroup;
  secondaryAction?: GroupSecondaryActionConfig;
  onOpenStateChange?: (open: boolean) => void;
};

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  isOpen,
  secondaryAction,
  onOpenStateChange,
}) => {
  const { themeSettings } = useThemeContext();
  const handleClick = useCallback(() => {
    onOpenStateChange?.(!isOpen);
  }, [isOpen, onOpenStateChange]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <GroupHeaderButton
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      theme={themeSettings}
    >
      <Tooltip title={group.description} placement="top" arrow>
        <GroupHeaderContent>
          <GroupHeaderLeftContent>
            <ArrowIcon direction={isOpen ? 'down' : 'right'} />

            {group.Icon && (
              <GroupIconContainer>
                <group.Icon />
              </GroupIconContainer>
            )}
            <GroupTitle>{group.title}</GroupTitle>
          </GroupHeaderLeftContent>
          {secondaryAction && isHovered && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                secondaryAction.onClick(group);
              }}
            >
              <secondaryAction.SecondaryActionButtonIcon group={group} />
            </div>
          )}
        </GroupHeaderContent>
      </Tooltip>
    </GroupHeaderButton>
  );
};

const GroupHeaderContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const GroupHeaderButton = styled(ListItemButton)<Themable>`
  display: flex;
  padding: 0 4px 0 0;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;

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

const GroupHeaderLeftContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const GroupIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
`;

const GroupTitle = styled(ListItemText)`
  span {
    font-size: 13px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    letter-spacing: 0.1px;
  }
`;
