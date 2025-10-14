import React, { useCallback } from 'react';

import styled from '@emotion/styled';
import List from '@mui/material/List';

import { Group } from './group';
import { GroupedItemsBrowserProps } from './types';

const GroupedItemsBrowserList = styled(List)`
  padding: 0;
  overflow-y: auto;
  width: 100%;
  height: 100%;
`;

/**
 * A generic component that displays a list of grouped items.
 */
export const GroupedItemsBrowser: React.FC<GroupedItemsBrowserProps> = ({
  groupedItems,
  groupSecondaryActionConfig,
  itemActionConfig,
  itemSecondaryActionConfig,
  onScrolledToBottom,
  collapseAll,
}) => {
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLUListElement>) => {
      const target = event.target as HTMLUListElement;
      // Check if scrolled to bottom (allowing a small margin)
      if (target.scrollHeight - target.scrollTop - target.clientHeight < 1) {
        onScrolledToBottom?.();
      }
    },
    [onScrolledToBottom],
  );
  return (
    <GroupedItemsBrowserList onScroll={handleScroll}>
      {groupedItems.map((group) => (
        <Group
          key={group.id}
          group={group}
          collapsed={collapseAll}
          groupSecondaryActionConfig={groupSecondaryActionConfig}
          itemActionConfig={itemActionConfig}
          itemSecondaryActionConfig={itemSecondaryActionConfig}
        />
      ))}
    </GroupedItemsBrowserList>
  );
};
