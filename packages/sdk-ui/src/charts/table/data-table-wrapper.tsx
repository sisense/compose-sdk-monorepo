import { useEffect, useMemo, useState } from 'react';
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
  DEFAULT_PADDING,
  HEADER_ELLIPSIZED_LENGTH,
  HEADER_HEIGHT,
  HEADER_PADDING,
  HEADER_TYPE_ICON_SPACING,
  MAX_WIDTH,
  ROW_HEIGHT,
} from './styles/style-constants';
import { getCellStyles } from './helpers/get-cell-styles';
import Tooltip from '@mui/material/Tooltip';
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
  height,
  width,
  customStyles,
  themeSettings,
  onSortUpdate,
}: DataTableWrapperProps) => {
  const showFieldTypeIcon =
    customStyles && customStyles.showFieldTypeIcon !== undefined
      ? customStyles.showFieldTypeIcon
      : true;
  const headerPadding = HEADER_PADDING + (showFieldTypeIcon ? HEADER_TYPE_ICON_SPACING : 0);
  const verticalPadding = customStyles?.paddingVertical || DEFAULT_PADDING;
  const horizontalPadding = customStyles?.paddingHorizontal || DEFAULT_PADDING;

  // minus 1px need to avoid crop of right border
  const widthVal =
    customStyles?.columns?.width === 'auto'
      ? (width - horizontalPadding * 2 - 1) / dataOptions.columns.length
      : undefined;

  const columnsOptions = useMemo(
    () =>
      dataOptions.columns.map((col) => ({
        isHtml: !!(col as Category).isHtml,
        width: widthVal,
      })),
    [dataOptions.columns, widthVal],
  );

  const [fontsLoaded, setFontsLoaded] = useState(document.fonts?.status === 'loaded');

  const fontFamily = themeSettings.typography?.fontFamily;
  const columnWidths = useMemo(() => {
    void fontsLoaded;
    return calcColumnWidths(dataTable, showFieldTypeIcon, columnsOptions, fontFamily);
  }, [dataTable, showFieldTypeIcon, columnsOptions, fontFamily, fontsLoaded]);

  useEffect(() => {
    document.fonts?.ready
      .then(() => {
        setFontsLoaded(true);
      })
      .catch((e) => {
        console.warn('Failed to observe font loading', e);
      });
  }, []);

  const columns = useMemo(
    () =>
      dataTable.columns.map((column, colIndex) => {
        // eslint-disable-next-line security/detect-object-injection
        const columnWidth = columnWidths[colIndex];
        // eslint-disable-next-line security/detect-object-injection
        const columnOptions = dataOptions.columns[colIndex];
        const headerCellStyle = getCellStyles({
          isHeaderCell: true,
          themeSettings,
          customStyles,
        });
        return columnWidth ? (
          <Column
            key={`col${colIndex}`}
            maxWidth={MAX_WIDTH}
            minWidth={MAX_WIDTH}
            allowCellsRecycling
            width={columnWidth}
            header={
              <Cell className={classnames(styles.tableHeader)} style={headerCellStyle}>
                <SortableTableColumnHeader
                  column={column}
                  onClick={onSortUpdate}
                  isSelected={!!Math.abs(column.direction)}
                  showFieldTypeIcon={showFieldTypeIcon}
                  sortIcon={customStyles?.sortIcon || 'standard'}
                >
                  {renderDisplayValue({
                    displayValue: columnOptions.title ?? columnOptions.name,
                    width: columnWidth,
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
                  // eslint-disable-next-line security/detect-object-injection
                  displayValue: dataTable.rows[rowIndex][colIndex].displayValue,
                  width: columnWidth,
                  padding: DATA_PADDING,
                  ellipsizedLength: DATA_ELLIPSIZED_LENGTH,
                  isHtml: (columnOptions as Category).isHtml ?? false,
                })}
              </Cell>
            )}
            align={alignmentForColumnType(column.type)}
          />
        ) : null;
      }),
    [
      dataTable,
      columnWidths,
      themeSettings,
      customStyles,
      onSortUpdate,
      showFieldTypeIcon,
      dataOptions,
      headerPadding,
    ],
  );

  return useMemo(
    () => (
      <div
        className={styles.tableWrapper}
        style={{
          padding: `${verticalPadding}px ${horizontalPadding}px`,
        }}
      >
        <Table
          className={styles.table}
          rowHeight={customStyles?.rowHeight || ROW_HEIGHT}
          rowsCount={dataTable.rows.length}
          width={width - horizontalPadding * 2}
          height={height - verticalPadding * 2}
          headerHeight={customStyles?.headerHeight || HEADER_HEIGHT}
        >
          {columns}
        </Table>
      </div>
    ),
    [columns, customStyles, dataTable, height, horizontalPadding, verticalPadding, width],
  );
};
