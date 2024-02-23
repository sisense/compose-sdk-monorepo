import React from 'react';

import { ListOfSortingDirections } from '../../../../data-handling/constants.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { Dropdown } = require('@sisense/shared-ui-components');

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
    <h1>DROPDOWN TODO</h1>
    // <Dropdown
    //     classNameDropdown="direction-selector"
    //     classNameMenu="sis-scope direction-selector__menu"
    //     items={items}
    //     selectedItemId={direction}
    //     onSelectItem={handleItemSelected}
    //     mask={false}
    // />
  );
};
