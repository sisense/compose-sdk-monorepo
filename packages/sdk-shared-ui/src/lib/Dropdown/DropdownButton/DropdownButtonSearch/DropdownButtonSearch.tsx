import React, { forwardRef, MouseEventHandler } from 'react';

import classNames from 'classnames';

import { Input } from '../../../Input';
import type { DropdownInputProps } from '../../types';
import { DEFAULT_SEARCH_WIDTH } from './constants';
import style from './DropdownButtonSearch.module.scss';

const noop = () => {};

export type DropdownButtonSearchProps = {
  width?: number;
  onClick?: MouseEventHandler;
  className?: string;
  inputProps?: DropdownInputProps;
};

export const DropdownButtonSearch = forwardRef<HTMLDivElement, DropdownButtonSearchProps>(
  (
    {
      width = DEFAULT_SEARCH_WIDTH,
      onClick = noop,
      inputProps = { onChange: noop },
      className = '',
    },
    ref,
  ) => {
    const dropdownSearchClass = classNames(className || style.searchInputWrapper);
    const styles = { width };

    return (
      <div
        ref={ref}
        style={styles}
        className={dropdownSearchClass}
        data-testid="search_input_container"
      >
        <Input onClicked={onClick} {...inputProps} />
      </div>
    );
  },
);
