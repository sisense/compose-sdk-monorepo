/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Column, Cell } from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.css';
import styles from './styles/data-table-wrapper.module.scss';
import { isNumber } from '@sisense/sdk-data';
import { SortableTableColumnHeader } from './header/sortable-table-column-header';
import classnames from 'classnames';
import { DataTableWrapperProps } from './types';
import { calcColumnWidths } from './helpers/calc-column-widths';
import {
  DATA_ELLIPSIZED_LENGTH,
  DATA_PADDING,
  HEADER_ELLIPSIZED_LENGTH,
  HEADER_HEIGHT,
  HEADER_PADDING,
  HEADER_TYPE_ICON_SPACING,
  MAX_WIDTH,
  ROW_HEIGHT,
} from './styles/style-constants';
import { getCellStyles } from './helpers/get-cell-styles';
import { Tooltip } from '@mui/material';
import { Category } from '@/chart-data-options/types';

const alignmentForColumnType = (columnType: string) => (isNumber(columnType) ? 'right' : 'left');

const renderDisplayValue = ({
  displayValue,
  width,
  padding,
  ellipsizedLength,
  isHtml,
}: {
  displayValue: string;
  width: number;
  padding: number;
  ellipsizedLength: number;
  isHtml?: boolean;
}) => {
  const maybeEllipsizedLength = displayValue.length > ellipsizedLength;
  return (
    <div
      className={styles.tableCellContent}
      style={{
        maxWidth: `${width - padding}px`,
      }}
    >
      {isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: displayValue }} />
      ) : maybeEllipsizedLength ? (
        <Tooltip title={displayValue}>
          <div>{displayValue}</div>
        </Tooltip>
      ) : (
        <div>{displayValue}</div>
      )}
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
  const showFieldTypeIcon =
    customStyles && customStyles.showFieldTypeIcon !== undefined
      ? customStyles.showFieldTypeIcon
      : true;
  const headerPadding = HEADER_PADDING + (showFieldTypeIcon ? HEADER_TYPE_ICON_SPACING : 0);

  const columnsOptions = useMemo(
    () =>
      dataOptions.columns.map((col) => ({
        isHtml: (col as Category).isHtml ?? false,
      })),
    [dataOptions],
  );

  const [columnWidths, setColumnWidths] = useState<number[]>(() =>
    calcColumnWidths(
      dataTable,
      isLoading,
      showFieldTypeIcon,
      columnsOptions,
      themeSettings.typography?.fontFamily,
    ),
  );

  useEffect(() => {
    if (isLoading !== previousIsLoadingRef.current) {
      if (!isLoading) {
        // transitioning from isLoading to done
        setColumnWidths(
          calcColumnWidths(
            dataTable,
            isLoading,
            showFieldTypeIcon,
            columnsOptions,
            themeSettings.typography?.fontFamily,
          ),
        );
      }
      previousIsLoadingRef.current = isLoading;
    }
  }, [isLoading, dataTable, themeSettings, columnsOptions, showFieldTypeIcon]);

  const isFontLoadingObserved = useRef(false);
  useEffect(() => {
    if (!isFontLoadingObserved.current && document.fonts) {
      isFontLoadingObserved.current = true;
      document.fonts.ready
        .then(() => {
          setColumnWidths(
            calcColumnWidths(
              dataTable,
              isLoading,
              showFieldTypeIcon,
              columnsOptions,
              themeSettings.typography?.fontFamily,
            ),
          );
        })
        .catch((e) => {
          throw e;
        });
    }
  }, [
    dataTable,
    isLoading,
    columnsOptions,
    themeSettings.typography?.fontFamily,
    showFieldTypeIcon,
  ]);

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
                      padding: headerPadding,
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
                    isHtml: (dataOptions.columns[colIndex] as Category).isHtml ?? false,
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
