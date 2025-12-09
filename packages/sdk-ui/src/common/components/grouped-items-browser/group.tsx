import { useEffect, useState } from 'react';

import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';

import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';

import { GroupHeader } from './group-header';
import { ItemRow } from './item-row';
import {
  GroupSecondaryActionConfig,
  ItemActionConfig,
  ItemSecondaryActionConfig,
  ItemsGroup,
} from './types';

type GroupProps = {
  group: ItemsGroup;
  groupSecondaryActionConfig?: GroupSecondaryActionConfig;
  itemActionConfig?: ItemActionConfig;
  itemSecondaryActionConfig?: ItemSecondaryActionConfig;
  collapsed?: boolean;
};

export const Group: React.FC<GroupProps> = ({
  group,
  groupSecondaryActionConfig,
  itemActionConfig,
  itemSecondaryActionConfig,
  collapsed,
}) => {
  const [isOpen, setIsOpen] = useState(!collapsed);
  const { themeSettings } = useThemeContext();
  useEffect(() => {
    setIsOpen(!collapsed);
  }, [collapsed]);

  return (
    <GroupContainer>
      <GroupHeader
        group={group}
        secondaryAction={groupSecondaryActionConfig}
        isOpen={isOpen}
        onOpenStateChange={setIsOpen}
      />

      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <GroupList theme={themeSettings}>
          {group.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              itemActionConfig={itemActionConfig}
              itemSecondaryActionConfig={itemSecondaryActionConfig}
            />
          ))}
        </GroupList>
      </Collapse>
    </GroupContainer>
  );
};

const GroupContainer = styled.div``;

const GroupList = styled(List)<Themable>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  gap: 4px;
  padding: 0;
`;
