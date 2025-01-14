import React from 'react';

import { Dropdown, type DropdownProps } from '@sisense/sdk-shared-ui/Dropdown';

import { ListOfSortingDirections } from '../../../../data-handling/constants.js';

type Props = {
  direction: ListOfSortingDirections;
  items: Array<{ caption: string; id: 'asc' } | { caption: string; id: 'desc' }>;
  onChange: (direction: ListOfSortingDirections) => void;
};

export const DirectionSelector = (props: Props) => {
  const { direction, items, onChange } = props;

  const handleItemSelected = (ft: { id: ListOfSortingDirections }) => {
    onChange(ft.id);
  };

  return (
    <Dropdown
      classNameDropdown="direction-selector"
      classNameMenu="sis-scope direction-selector__menu"
      items={items}
      selectedItemId={direction}
      onSelectItem={handleItemSelected as DropdownProps['onSelectItem']}
      mask={false}
      scrollbarProps={{
        // Custom style to remove bottom padding below the last item
        style: {
          marginBottom: '-8px',
        },
      }}
    />
  );
};
