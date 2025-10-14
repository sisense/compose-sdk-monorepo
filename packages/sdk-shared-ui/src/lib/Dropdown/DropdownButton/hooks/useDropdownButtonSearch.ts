import { RefObject, SyntheticEvent, useCallback, useEffect, useState } from 'react';

import type { DropdownInputProps, DropdownItem } from '../../types';

export const useDropdownButtonSearch = (
  isOpen: boolean,
  selectedItem?: DropdownItem,
  searchInputProps?: DropdownInputProps,
  ref?: RefObject<HTMLDivElement | null>,
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

  const selectInputValue = useCallback((): void => {
    const inputElement = ref?.current?.getElementsByTagName('input')[0];
    inputElement?.select();
  }, [ref]);

  useEffect(() => {
    if (isOpen) {
      setInputProps({ ...searchInputProps, value: selectedItem?.caption });
      selectInputValue();
    } else {
      searchInputProps?.onChange('');
    }
  }, [isOpen, searchInputProps, selectedItem?.caption, selectInputValue]);

  useEffect(() => {
    if (isOpen && inputProps.value !== searchInputProps?.value) {
      selectInputValue();
    }
  }, [inputProps.value, isOpen, searchInputProps?.value, selectInputValue]);

  const handlers = {
    handleOnSearchInputClick,
    handleOnSearchInputChange,
  };

  return { handlers, inputProps };
};
