import { simpleColumnType } from '@sisense/sdk-data';

import { DataTable } from '../../../../core/chart-data-processor/table-processor.js';
import {
  DATA_PADDING,
  HEADER_PADDING,
  HEADER_TYPE_ICON_SPACING,
  MAX_WIDTH,
  MIN_WIDTH,
} from '../styles/style-constants.js';

/** Optional settings for {@link calcColumnWidths}. */
export type CalcColumnWidthsOptions = {
  /** Font family used to measure text widths. Defaults to `'Open Sans'`. */
  fontFamily?: string;
  /** Lower bound for a computed column width, in pixels. Defaults to {@link MIN_WIDTH}. */
  minWidth?: number;
  /** Upper bound for a computed column width, in pixels. Defaults to {@link MAX_WIDTH}. */
  maxWidth?: number;
};

/**
 * Calculates each column's pixel width from its header text and widest cell value,
 * clamped between `minWidth` and `maxWidth`.
 * @param dataTable - Table data whose columns and rows are measured.
 * @param isShowFieldTypeIcon - Whether the header reserves extra space for a field-type icon.
 * @param columnsOptions - Per-column overrides, indexed the same as `dataTable.columns`.
 * @param options - See {@link CalcColumnWidthsOptions}.
 * @returns The computed width, in pixels, for each column in `dataTable.columns` order.
 */
export const calcColumnWidths = (
  dataTable: DataTable,
  isShowFieldTypeIcon: boolean,
  columnsOptions: {
    isHtml: boolean;
    width?: number;
  }[],
  { fontFamily, minWidth = MIN_WIDTH, maxWidth = MAX_WIDTH }: CalcColumnWidthsOptions = {},
): number[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return [];
  }
  // Guard against a misconfigured bounds pair (e.g. minWidth > maxWidth) so the effective
  // upper bound is never below the effective lower bound.
  const effectiveMinWidth = Math.min(minWidth, maxWidth);
  const effectiveMaxWidth = Math.max(minWidth, maxWidth);
  ctx.font = `13px ${fontFamily || 'Open Sans'}`;
  // get pixel width of headers
  const columnNameWidths = dataTable.columns.map((column) => {
    const pixelForValue = ctx.measureText(column.name).width;
    return pixelForValue + HEADER_PADDING + (isShowFieldTypeIcon ? HEADER_TYPE_ICON_SPACING : 0);
  });

  const numericDigitWidth = ctx.measureText('0').width;
  const columnsWithSimpleTypes = dataTable.columns.map((column) => {
    return { type: simpleColumnType(column.type), index: column.index };
  });
  // get pixel width of longest data for each column
  const { rows } = dataTable;
  const columnDataWidths = columnsWithSimpleTypes.map((column) => {
    const pixelForValue = rows.reduce((longestWidth, currentRow) => {
      const displayValue = currentRow[column.index].displayValue;
      const value = columnsOptions[column.index]?.isHtml
        ? getTextFromRawHtml(displayValue)
        : displayValue;
      const currentWidth =
        column.type === 'number'
          ? currentRow[column.index].displayValue.length * numericDigitWidth
          : ctx.measureText(value).width;
      return Math.max(longestWidth, currentWidth);
    }, 0);
    return DATA_PADDING + pixelForValue;
  });
  // get max pixel between data or header for each column
  return columnNameWidths.map((nameWidth, index) => {
    const explicitWidth = columnsOptions[index]?.width;
    return explicitWidth
      ? explicitWidth
      : Math.ceil(
          Math.max(
            effectiveMinWidth,
            Math.min(effectiveMaxWidth, Math.max(nameWidth, columnDataWidths[index])),
          ),
        );
  });
};

function getTextFromRawHtml(rawHtml: string) {
  const container = document.createElement('div');
  container.innerHTML = rawHtml;
  return getTextFromNode(container);
}

function getTextFromNode(node: Node) {
  let i, result, text, child;
  result = '';
  for (i = 0; i < node.childNodes.length; i++) {
    child = node.childNodes[i];
    text = null;
    if (child.nodeType === 1) {
      text = getTextFromNode(child);
    } else if (child.nodeType === 3) {
      text = child.nodeValue;
    }
    if (text) {
      result += text;
    }
  }
  return result;
}
