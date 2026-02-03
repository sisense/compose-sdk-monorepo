import { simpleColumnType } from '@sisense/sdk-data';

import { DataTable } from '../../../../core/chart-data-processor/table-processor.js';
import {
  DATA_PADDING,
  HEADER_PADDING,
  HEADER_TYPE_ICON_SPACING,
  MAX_WIDTH,
  MIN_WIDTH,
} from '../styles/style-constants.js';

export const calcColumnWidths = (
  dataTable: DataTable,
  isShowFieldTypeIcon: boolean,
  columnsOptions: {
    isHtml: boolean;
    width?: number;
  }[],
  fontFamily?: string,
): number[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return [];
  }
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
    return columnsOptions[index]?.width
      ? (columnsOptions[index].width as number)
      : Math.ceil(
          Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.max(nameWidth, columnDataWidths[index]))),
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
