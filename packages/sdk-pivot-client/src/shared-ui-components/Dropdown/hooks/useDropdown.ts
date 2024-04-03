import { useState } from 'react';

import type { MenuItemConfig } from '../../Menu';

export const useDropdown = (
  onSelectItem: (item: MenuItemConfig) => void,
  open: boolean,
  disabled: boolean,
) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleDropdownClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOnSelectItem = (item: MenuItemConfig) => {
    onSelectItem(item);
    handleDropdownClick();
  };

  const handlers = {
    handleOnSelectItem,
    handleDropdownClick,
  };

  return { handlers, isOpen };
};
