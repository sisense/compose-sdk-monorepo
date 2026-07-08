import { useCallback, useEffect, useMemo, useState } from 'react';

import Tooltip from '@mui/material/Tooltip';
import { isNumber } from '@sisense/sdk-data';
import classnames from 'classnames';
import DOMPurify from 'dompurify';
import { Cell, Column, Table } from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.css';

import { getDataOptionTitle } from '@/domains/visualizations/core/chart-data-options/utils.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { getScrollbarWidth } from '@/shared/utils/get-scrollbar-width';

import { SortableTableColumnHeader } from './header/sortable-table-column-header.js';
import { calcColumnWidths } from './helpers/calc-column-widths.js';
import { getCellStyles } from './helpers/get-cell-styles.js';
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
  MIN_WIDTH,
  ROW_HEIGHT,
} from './styles/style-constants.js';
import { DataTableWrapperProps } from './types.js';

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
  const isResizable = customStyles?.columns?.resizable !== false;
  const controlledWidths = customStyles?.columns?.widths;
  const columnMinWidth = customStyles?.columns?.minWidth ?? MIN_WIDTH;
  const columnMaxWidth = customStyles?.columns?.maxWidth ?? MAX_WIDTH;
  // Guard against a misconfigured bounds pair (e.g. minWidth > maxWidth) so drag-resize
  // constraints stay consistent with {@link calcColumnWidths}.
  const effectiveColumnMinWidth = Math.min(columnMinWidth, columnMaxWidth);
  const effectiveColumnMaxWidth = Math.max(columnMinWidth, columnMaxWidth);
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
        width: 'width' in col ? col.width : widthVal,
      })),
    [dataOptions.columns, widthVal],
  );

  const [fontsLoaded, setFontsLoaded] = useState(document.fonts?.status === 'loaded');
  const [resizedWidths, setResizedWidths] = useState<Record<number, number>>({});

  const fontFamily = themeSettings.typography?.fontFamily;
  const columnWidths = useMemo(() => {
    void fontsLoaded;
    return calcColumnWidths(dataTable, showFieldTypeIcon, columnsOptions, {
      fontFamily,
      minWidth: effectiveColumnMinWidth,
      maxWidth: effectiveColumnMaxWidth,
    });
  }, [
    effectiveColumnMaxWidth,
    effectiveColumnMinWidth,
    dataTable,
    showFieldTypeIcon,
    columnsOptions,
    fontFamily,
    fontsLoaded,
  ]);

  // Identifies the column schema (not the paginated row data), so that resized widths
  // survive paging through TableComponent and only reset when the columns themselves change.
  const columnsSchemaKey = useMemo(
    () =>
      dataTable.columns.map((column) => `${column.index}:${column.name}:${column.type}`).join('|'),
    [dataTable.columns],
  );

  useEffect(() => {
    setResizedWidths({});
  }, [columnsSchemaKey]);

  const effectiveColumnWidths = useMemo(
    () =>
      dataTable.columns.map((_column, colIndex) => {
        // eslint-disable-next-line security/detect-object-injection
        const controlledWidth = controlledWidths?.[colIndex];
        if (controlledWidth !== undefined) {
          return controlledWidth;
        }
        // eslint-disable-next-line security/detect-object-injection
        const resizedWidth = resizedWidths[colIndex];
        if (resizedWidth !== undefined) {
          return resizedWidth;
        }
        // eslint-disable-next-line security/detect-object-injection
        return columnWidths[colIndex];
      }),
    [controlledWidths, dataTable.columns, columnWidths, resizedWidths],
  );

  // `columnKey` is set to the column's index (see the `<Column>` element below) rather than
  // `column.name`, since column names are not guaranteed to be unique.
  const onColumnResizeEndCallback = useCallback(
    (newWidth: number, columnKey: string) => {
      const resizedColIndex = Number(columnKey);
      const nextWidths = dataTable.columns.map((_column, colIndex) =>
        colIndex === resizedColIndex
          ? newWidth
          : // eslint-disable-next-line security/detect-object-injection
            effectiveColumnWidths[colIndex] ?? columnWidths[colIndex],
      );

      if (controlledWidths === undefined) {
        setResizedWidths((prev) => ({ ...prev, [resizedColIndex]: newWidth }));
      }

      customStyles?.columns?.onColumnsResize?.(nextWidths);
    },
    [
      columnWidths,
      controlledWidths,
      customStyles?.columns,
      dataTable.columns,
      effectiveColumnWidths,
    ],
  );

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
        const columnWidth = effectiveColumnWidths[colIndex];
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
            columnKey={`${colIndex}`}
            isResizable={isResizable}
            minWidth={effectiveColumnMinWidth}
            maxWidth={effectiveColumnMaxWidth}
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
      effectiveColumnWidths,
      themeSettings,
      customStyles,
      onSortUpdate,
      showFieldTypeIcon,
      dataOptions,
      headerPadding,
      isResizable,
      effectiveColumnMinWidth,
      effectiveColumnMaxWidth,
    ],
  );

  return useMemo(
    () => (
      <div
        data-testid="data-table-wrapper"
        className={styles.tableWrapper}
        style={{
          padding: `${verticalPadding}px ${horizontalPadding}px`,
          ['--csdk-table-column-resizer-color' as string]: themeSettings.general.brandColor,
        }}
      >
        <Table
          className={styles.table}
          rowHeight={customStyles?.rowHeight || ROW_HEIGHT}
          rowsCount={dataTable.rows.length}
          width={width - horizontalPadding * 2}
          height={height - verticalPadding * 2}
          headerHeight={customStyles?.headerHeight || HEADER_HEIGHT}
          isColumnResizing={false}
          onColumnResizeEndCallback={isResizable ? onColumnResizeEndCallback : undefined}
        >
          {columns}
        </Table>
      </div>
    ),
    [
      columns,
      customStyles,
      dataTable,
      height,
      horizontalPadding,
      isResizable,
      onColumnResizeEndCallback,
      themeSettings.general.brandColor,
      verticalPadding,
      width,
    ],
  );
};
