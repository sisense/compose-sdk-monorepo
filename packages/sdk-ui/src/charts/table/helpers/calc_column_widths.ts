import { DataTable } from '../../../chart-data-processor/table_processor';
import { simpleColumnType } from '@sisense/sdk-data';
import {
  DATA_PADDING,
  EXTRA_PIXELS,
  HEADER_PADDING,
  MAX_WIDTH,
  MIN_WIDTH,
} from '../styles/style_constants';

export const calcColumnWidths = (
  dataTable: DataTable,
  isLoading: boolean,
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
    return pixelForValue + HEADER_PADDING + EXTRA_PIXELS;
  });

  const numericDigitWidth = ctx.measureText('0').width;
  const columnsWithSimpleTypes = dataTable.columns.map((column) => {
    return { type: simpleColumnType(column.type), index: column.index };
  });
  // get pixel width of longest data for each column
  const rows = isLoading ? dataTable.rows.slice(0, 100) : dataTable.rows;
  const columnDataWidths = columnsWithSimpleTypes.map((column) => {
    const pixelForValue = rows.reduce((longestWidth, currentRow) => {
      const currentWidth =
        column.type === 'number'
          ? currentRow[column.index].displayValue.length * numericDigitWidth
          : ctx.measureText(currentRow[column.index].displayValue).width;
      return Math.max(longestWidth, currentWidth);
    }, 0);
    return DATA_PADDING + pixelForValue + EXTRA_PIXELS;
  });
  // get max pixel between data or header for each column
  return columnNameWidths.map((nameWidth, index) => {
    return Math.ceil(
      Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.max(nameWidth, columnDataWidths[index]))),
    );
  });
};
