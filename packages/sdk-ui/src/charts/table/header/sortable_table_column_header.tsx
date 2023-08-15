import React from 'react';
import styles from '../styles/table_column_header.module.scss';
import classnames from 'classnames';
import { Column } from '../../../chart-data-processor/table_processor';
import { FieldTypeIcon } from './field_type_icon';

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
      <span className={styles.headerLabel}>{children}</span>
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
