import styled from '@emotion/styled';
import { useState } from 'react';
import {
  ItemsGroup,
  GroupSecondaryActionConfig,
  ItemActionConfig,
  ItemSecondaryActionConfig,
} from './types';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import { ItemRow } from './item-row';
import { GroupHeader } from './group-header';

type GroupProps = {
  group: ItemsGroup;
  groupSecondaryActionConfig?: GroupSecondaryActionConfig;
  itemActionConfig?: ItemActionConfig;
  itemSecondaryActionConfig?: ItemSecondaryActionConfig;
};

export const Group: React.FC<GroupProps> = ({
  group,
  groupSecondaryActionConfig,
  itemActionConfig,
  itemSecondaryActionConfig,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <GroupContainer>
      <GroupHeader
        group={group}
        secondaryAction={groupSecondaryActionConfig}
        isOpen={isOpen}
        onOpenStateChange={setIsOpen}
      />

      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <GroupList>
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

const GroupList = styled(List)`
  gap: 4px;
  padding: 0;
`;
