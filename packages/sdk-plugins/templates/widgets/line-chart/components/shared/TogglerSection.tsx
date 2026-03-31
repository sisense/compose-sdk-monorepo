import React from 'react';

import classnames from 'classnames';

import { Switcher } from './Switcher';
import styles from './TogglerSection.module.scss';

export const TogglerSection = ({
  label,
  checked,
  checkedBackground,
  onClick,
}: {
  label: string;
  checked: boolean;
  checkedBackground?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className={classnames(styles.togglerSection, {
        [styles.withBackground]: !checked,
        [styles.withCheckedBackground]: checked && checkedBackground,
      })}
    >
      <div>{label}</div>
      <div className={styles.toggler}>
        <Switcher active={checked} onClick={onClick} />
      </div>
    </div>
  );
};
