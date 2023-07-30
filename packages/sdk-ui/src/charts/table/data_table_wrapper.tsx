/* eslint-disable max-lines-per-function */
import React, { useEffect, useRef, useState } from 'react';
import { Table, Column, Cell } from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.css';
import styles from './styles/data_table_wrapper.module.scss';
import { isNumber } from '@sisense/sdk-data';
import { SortableTableColumnHeader } from './header/sortable_table_column_header';
import classnames from 'classnames';
import { DataTableWrapperProps } from './types';
import { calcColumnWidths } from './helpers/calc_column_widths';
import {
  DATA_ELLIPSIZED_LENGTH,
  DATA_PADDING,
  HEADER_ELLIPSIZED_LENGTH,
  HEADER_HEIGHT,
  HEADER_PADDING,
  MAX_WIDTH,
  ROW_HEIGHT,
} from './styles/style_constants';
import { getCellStyles } from './helpers/get_cell_styles';

const alignmentForColumnType = (columnType: string) => (isNumber(columnType) ? 'right' : 'left');

const renderDisplayValue = ({
  displayValue,
  width,
  padding,
  ellipsizedLength,
}: {
  displayValue: string;
  width: number;
  padding: number;
  ellipsizedLength: number;
}) => {
  const maybeEllipsizedLength = displayValue.length > ellipsizedLength;
  return (
    <div
      className={styles.tableCellContent}
      style={{
        maxWidth: `${width - padding}px`,
      }}
    >
      {!maybeEllipsizedLength && <div>{displayValue}</div>}
      {maybeEllipsizedLength &&
        // TODO: wrap value with tooltip to show full text value
        displayValue}
    </div>
  );
};

export const DataTableWrapper = ({
  dataTable,
  dataOptions,
  isLoading,
  height,
  width,
  customStyles,
  themeSettings,
  onSortUpdate,
}: DataTableWrapperProps) => {
  const previousIsLoadingRef = useRef<boolean>(isLoading);

  const [columnWidths, setColumnWidths] = useState<number[]>(() =>
    calcColumnWidths(dataTable, isLoading),
  );

  useEffect(() => {
    if (isLoading !== previousIsLoadingRef.current) {
      if (!isLoading) {
        // transitioning from isLoading to done
        setColumnWidths(
          calcColumnWidths(dataTable, isLoading, themeSettings.typography?.fontFamily),
        );
      }
      previousIsLoadingRef.current = isLoading;
    }
  }, [isLoading, dataTable, themeSettings]);

  const showFieldTypeIcon =
    customStyles && customStyles.showFieldTypeIcon !== undefined
      ? customStyles.showFieldTypeIcon
      : true;

  return (
    <div className={styles.tableWrapper}>
      <Table
        className={styles.table}
        rowHeight={customStyles?.rowHeight || ROW_HEIGHT}
        rowsCount={dataTable.rows.length}
        width={width}
        height={height}
        headerHeight={customStyles?.headerHeight || HEADER_HEIGHT}
      >
        {dataTable.columns.map((column, colIndex) => {
          return columnWidths[colIndex] ? (
            <Column
              key={`col${colIndex}`}
              maxWidth={MAX_WIDTH}
              minWidth={MAX_WIDTH}
              allowCellsRecycling
              width={columnWidths[colIndex]}
              header={
                <Cell
                  className={classnames(styles.tableHeader)}
                  style={getCellStyles({
                    isHeaderCell: true,
                    themeSettings,
                    customStyles,
                  })}
                >
                  <SortableTableColumnHeader
                    column={column}
                    onClick={onSortUpdate}
                    isSelected={!!Math.abs(column.direction)}
                    showFieldTypeIcon={showFieldTypeIcon}
                    sortIcon={customStyles?.sortIcon || 'standard'}
                  >
                    {renderDisplayValue({
                      displayValue:
                        dataOptions.columns[colIndex].title ?? dataOptions.columns[colIndex].name,
                      width: columnWidths[colIndex],
                      padding: HEADER_PADDING,
                      ellipsizedLength: HEADER_ELLIPSIZED_LENGTH,
                    })}
                  </SortableTableColumnHeader>
                </Cell>
              }
              cell={({ rowIndex, ...props }) => (
                <Cell
                  className={classnames(styles.tableCell)}
                  style={getCellStyles({
                    colIndex,
                    rowIndex,
                    themeSettings,
                    customStyles,
                  })}
                  {...props}
                >
                  {renderDisplayValue({
                    displayValue: dataTable.rows[rowIndex][colIndex].displayValue,
                    width: columnWidths[colIndex],
                    padding: DATA_PADDING,
                    ellipsizedLength: DATA_ELLIPSIZED_LENGTH,
                  })}
                </Cell>
              )}
              align={alignmentForColumnType(dataTable.columns[colIndex].type)}
            />
          ) : null;
        })}
      </Table>
    </div>
  );
};
