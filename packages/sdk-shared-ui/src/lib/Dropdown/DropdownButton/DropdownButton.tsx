import React, { FC, useRef } from 'react';

import classNames from 'classnames';

import type { DropdownInputProps, DropdownItem } from '../types';
import style from './DropdownButton.module.scss';
import { DropdownButtonBody } from './DropdownButtonBody';
import { DropdownButtonSearch } from './DropdownButtonSearch';
import { useDropdownButtonSearch } from './hooks';

export type DropdownButtonProps = {
  items?: DropdownItem[];
  selectedShowIcon?: boolean;
  placeholder?: string;
  disabled?: boolean;
  selectedItemId?: string;
  width?: number;
  inlineVariant?: boolean;
  classNameDropdown?: string;
  classNameButton?: string;
  classNameSearch?: string;
  searchInputProps?: DropdownInputProps;
  isOpen?: boolean;
};

export const DropdownButton: FC<DropdownButtonProps> = ({
  items = [],
  selectedShowIcon = true,
  placeholder = '',
  disabled,
  selectedItemId,
  width,
  inlineVariant,
  classNameDropdown,
  classNameButton,
  classNameSearch,
  searchInputProps,
  isOpen = false,
}) => {
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const ref = useRef<HTMLDivElement>(null);

  const {
    inputProps,
    handlers: { handleOnSearchInputClick, handleOnSearchInputChange },
  } = useDropdownButtonSearch(isOpen, selectedItem, searchInputProps, ref);

  const dropDownButtonClasses = classNames(
    classNameButton,
    style.dropdownButton,
    {
      [style.disabled]: disabled,
      [style.open]: isOpen,
      [style.inlineVariant]: inlineVariant,
    },
    classNameDropdown,
  );

  return (
    <>
      {searchInputProps && isOpen && !disabled ? (
        <DropdownButtonSearch
          ref={ref}
          width={width}
          onClick={handleOnSearchInputClick}
          inputProps={{ ...inputProps, onChange: handleOnSearchInputChange }}
          className={classNameSearch}
        />
      ) : (
        <DropdownButtonBody
          selectedItem={selectedItem}
          width={width}
          placeholder={placeholder}
          selectedShowIcon={selectedShowIcon}
          dropDownButtonClasses={dropDownButtonClasses}
        />
      )}
    </>
  );
};
