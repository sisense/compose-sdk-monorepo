import { useEffect, useMemo, useState } from 'react';

import Tooltip from '@mui/material/Tooltip';
import { isNumber } from '@sisense/sdk-data';
import classnames from 'classnames';
import DOMPurify from 'dompurify';
import { Cell, Column, Table } from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.css';

import { getDataOptionTitle } from '@/chart-data-options/utils';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { getScrollbarWidth } from '@/utils/get-scrollbar-width';

import { SortableTableColumnHeader } from './header/sortable-table-column-header';
import { calcColumnWidths } from './helpers/calc-column-widths';
import { getCellStyles } from './helpers/get-cell-styles';
import styles from './styles/data-table-wrapper.module.scss';
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
import { DataTableWrapperProps } from './types';

const alignmentForColumnType = (columnType: string) => (isNumber(columnType) ? 'right' : 'left');

const htmlExp = new RegExp('<\\/?[\\w\\s="/.\':;#-\\/\\?]+>');

/**
 * Renders a table cell value, optionally as HTML and/or with ellipsis and tooltip for long content.
 * If HTML rendering is enabled and the value contains HTML, it can be sanitized before rendering.
 *
 * @param displayValue - The string value to display in the cell.
 * @param width - The width of the cell in pixels.
 * @param padding - The padding to apply inside the cell.
 * @param ellipsizedLength - The maximum length before the value is truncated and shown with a tooltip.
 * @param isHtml - Optional flag to force HTML rendering for the value.
 */
const CellDisplayValue = ({
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
  const { app } = useSisenseContext();
  const allowHtml = app?.settings?.chartConfig?.tabular?.htmlContent?.enabled;
  const sanitizeContents = app?.settings?.chartConfig?.tabular?.htmlContent?.sanitizeContents;

  const { isHtmlValue, value } = useMemo(() => {
    let isHtmlValue = isHtml;
    if (allowHtml && typeof isHtmlValue === 'undefined') {
      isHtmlValue = htmlExp.test(displayValue);
    }
    const value = isHtmlValue && sanitizeContents ? DOMPurify.sanitize(displayValue) : displayValue;
    return { isHtmlValue, value };
  }, [allowHtml, isHtml, displayValue, sanitizeContents]);

  const maybeEllipsizedLength = value.length > ellipsizedLength;
  return (
    <div
      className={styles.tableCellContent}
      style={{
        maxWidth: `${width - padding}px`,
      }}
    >
      {isHtmlValue ? (
        <div dangerouslySetInnerHTML={{ __html: value }} />
      ) : maybeEllipsizedLength ? (
        <Tooltip title={value}>
          <div>{value}</div>
        </Tooltip>
      ) : (
        <div>{value}</div>
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

  // subtract scrollbar width to avoid horizontal scroll and crop of the right border
  const widthVal =
    customStyles?.columns?.width === 'auto'
      ? (width - horizontalPadding * 2 - getScrollbarWidth()) / dataOptions.columns.length
      : undefined;

  const columnsOptions = useMemo(
    () =>
      dataOptions.columns.map((col) => ({
        isHtml: 'isHtml' in col && !!col.isHtml,
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
                  <CellDisplayValue
                    displayValue={getDataOptionTitle(columnOptions)}
                    width={columnWidth}
                    padding={headerPadding}
                    ellipsizedLength={HEADER_ELLIPSIZED_LENGTH}
                  />
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
                <CellDisplayValue
                  // eslint-disable-next-line security/detect-object-injection
                  displayValue={dataTable.rows[rowIndex][colIndex].displayValue}
                  width={columnWidth}
                  padding={DATA_PADDING}
                  ellipsizedLength={DATA_ELLIPSIZED_LENGTH}
                  isHtml={'isHtml' in columnOptions ? columnOptions.isHtml : undefined}
                />
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
