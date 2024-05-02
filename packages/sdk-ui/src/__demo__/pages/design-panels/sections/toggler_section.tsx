import React from 'react';
import styles from './toggler_section.module.scss';
import classnames from 'classnames';
import { Switcher } from './switcher';

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
