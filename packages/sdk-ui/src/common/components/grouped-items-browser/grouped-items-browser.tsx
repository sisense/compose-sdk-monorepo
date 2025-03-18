import React from 'react';
import { GroupedItemsBrowserProps } from './types';
import { Group } from './group';
import List from '@mui/material/List';
import styled from '@emotion/styled';

const GroupedItemsBrowserContainer = styled.div`
  background-color: #f9f9f9;
  overflow-y: auto;
  height: 100%;
  width: 100%;
`;

/**
 * A generic component that displays a list of grouped items.
 */
export const GroupedItemsBrowser: React.FC<GroupedItemsBrowserProps> = ({
  groupedItems,
  groupSecondaryActionConfig,
  itemActionConfig,
  itemSecondaryActionConfig,
}) => {
  return (
    <GroupedItemsBrowserContainer>
      <List>
        {groupedItems.map((group) => (
          <Group
            key={group.id}
            group={group}
            groupSecondaryActionConfig={groupSecondaryActionConfig}
            itemActionConfig={itemActionConfig}
            itemSecondaryActionConfig={itemSecondaryActionConfig}
          />
        ))}
      </List>
    </GroupedItemsBrowserContainer>
  );
};
