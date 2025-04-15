import React from 'react';

import { DEPRECATED_Icon } from '../DEPRECATED_Icon';
import styles from './CheckableList.module.scss';

type Item = {
  name: string;
  value: string;
  checked: boolean;
  dataTestId?: string;
};

export type CheckableListProps = {
  items: Item[];
  onChange: (value: string) => void;
  className?: string;
};

const CheckableList = ({ items, className, onChange }: CheckableListProps) => {
  return (
    <div className={className}>
      {items.map((item) => (
        <div
          key={item.value}
          className={styles.item}
          onClick={() => onChange(item.value)}
          data-testid={item.dataTestId}
        >
          <span className={styles.name}>{item.name}</span>
          {item.checked && (
            <DEPRECATED_Icon className={styles.icon} name="general-vi-small-white" />
          )}
        </div>
      ))}
    </div>
  );
};

export default CheckableList;
export { CheckableList };
