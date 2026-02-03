import React from 'react';

import classnames from 'classnames';

import { Column } from '../../../../core/chart-data-processor/table-processor.js';
import styles from '../styles/table-column-header.module.scss';
import { FieldTypeIcon } from './field-type-icon.js';

export const SortableTableColumnHeader: React.FunctionComponent<{
  column: Column;
  onClick: (column: Column) => void;
  isSelected: boolean;
  children: React.ReactNode;
  showFieldTypeIcon?: boolean;
  sortIcon?: 'caret' | 'standard';
}> = ({ column, onClick, isSelected, children, showFieldTypeIcon, sortIcon = 'standard' }) => {
  return (
    <div
      className={styles.headerCell}
      onClick={() => {
        onClick(column);
      }}
    >
      {showFieldTypeIcon && <FieldTypeIcon columnType={column.type} />}
      <div className={styles.headerLabel}>{children}</div>
      <div
        className={classnames(styles.sortIcon, {
          [styles.caret]: sortIcon === 'caret',
          [styles.standard]: sortIcon === 'standard',
          [styles.noSort]: !isSelected || column.direction === 0,
          [styles.sortAscending]: isSelected && column.direction === 1,
          [styles.sortDescending]: isSelected && column.direction === -1,
        })}
      />
    </div>
  );
};
