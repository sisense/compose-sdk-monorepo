import { RefObject, SyntheticEvent, useEffect, useState } from 'react';

import type { DropdownInputProps, DropdownItem } from '../../types';

export const useDropdownButtonSearch = (
  isOpen: boolean,
  selectedItem?: DropdownItem,
  searchInputProps?: DropdownInputProps,
  ref?: RefObject<HTMLDivElement>,
) => {
  const [inputProps, setInputProps] = useState({
    ...searchInputProps,
    value: selectedItem?.caption,
  });

  const handleOnSearchInputClick = (event: SyntheticEvent): void => {
    event.stopPropagation();
  };

  const handleOnSearchInputChange = (value: string): void => {
    searchInputProps?.onChange(value);
    setInputProps({ ...searchInputProps, value });
  };

  const selectInputValue = (): void => {
    const inputElement = ref?.current?.getElementsByTagName('input')[0];
    inputElement?.select();
  };

  useEffect(() => {
    if (isOpen) {
      setInputProps({ ...searchInputProps, value: selectedItem?.caption });
      selectInputValue();
    } else {
      searchInputProps?.onChange('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputProps.value !== searchInputProps?.value) {
      selectInputValue();
    }
  }, [inputProps.value]);

  const handlers = {
    handleOnSearchInputClick,
    handleOnSearchInputChange,
  };

  return { handlers, inputProps };
};
