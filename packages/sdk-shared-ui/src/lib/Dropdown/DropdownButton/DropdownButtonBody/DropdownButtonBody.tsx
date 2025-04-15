import React, { FC } from 'react';

import { DEPRECATED_Icon } from '../../../DEPRECATED_Icon';
import type { DropdownItem } from '../../types';
import style from '../DropdownButton.module.scss';

export type DropdownButtonBodyProps = {
  selectedItem?: DropdownItem;
  width?: number;
  dropDownButtonClasses?: string;
  resolvedCaptionClassName?: string;
  selectedShowIcon?: boolean;
  placeholder?: string;
};

export const DropdownButtonBody: FC<DropdownButtonBodyProps> = ({
  selectedItem,
  width,
  dropDownButtonClasses,
  selectedShowIcon = true,
  placeholder = '',
}) => {
  const { caption, iconName } = selectedItem || {};
  const styles = width ? { width, minWidth: 'inherit' } : {};

  return (
    <div className={dropDownButtonClasses} title={caption} style={styles}>
      {selectedShowIcon && iconName && (
        <DEPRECATED_Icon className={style.selectedIcon} name={iconName} />
      )}
      <div className={style.chosenTitle}>{caption || placeholder}</div>
      <div className={style.clickIcon}>
        <DEPRECATED_Icon name={'general-arrow-down'} />
      </div>
    </div>
  );
};
