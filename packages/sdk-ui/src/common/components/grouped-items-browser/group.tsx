import styled from '@emotion/styled';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useCallback, useState } from 'react';
import {
  ItemsGroup,
  GroupSecondaryActionConfig,
  ItemActionConfig,
  ItemSecondaryActionConfig,
} from './types.js';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import { ItemRow } from './item-row.js';
import { ArrowIcon } from '@/common/icons/arrow-icon.js';

type GroupProps = {
  group: ItemsGroup;
  groupSecondaryActionConfig?: GroupSecondaryActionConfig;
  itemActionConfig?: ItemActionConfig;
  itemSecondaryActionConfig?: ItemSecondaryActionConfig;
};

type GroupHeaderProps = {
  isOpen: boolean;
  group: ItemsGroup;
  secondaryAction?: GroupSecondaryActionConfig;
  onOpenStateChange?: (open: boolean) => void;
};

const GroupHeaderContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const GroupHeaderLeftContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ArrowIconContainer = styled.div`
  display: flex;
  align-items: center;
  width: 24px;
  height: 24px;
`;

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  isOpen,
  secondaryAction,
  onOpenStateChange,
}) => {
  const handleClick = useCallback(() => {
    onOpenStateChange?.(!isOpen);
  }, [isOpen, onOpenStateChange]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <ListItemButton
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GroupHeaderContent>
        <GroupHeaderLeftContent>
          <ArrowIconContainer>
            <ArrowIcon direction={isOpen ? 'down' : 'right'} />
          </ArrowIconContainer>

          {group.Icon && <group.Icon />}
          <ListItemText primary={group.title} />
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
    </ListItemButton>
  );
};

export const Group: React.FC<GroupProps> = ({
  group,
  groupSecondaryActionConfig,
  itemActionConfig,
  itemSecondaryActionConfig,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div>
      <GroupHeader
        group={group}
        secondaryAction={groupSecondaryActionConfig}
        isOpen={isOpen}
        onOpenStateChange={setIsOpen}
      />

      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List>
          {group.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              itemActionConfig={itemActionConfig}
              itemSecondaryActionConfig={itemSecondaryActionConfig}
            />
          ))}
        </List>
      </Collapse>
    </div>
  );
};
