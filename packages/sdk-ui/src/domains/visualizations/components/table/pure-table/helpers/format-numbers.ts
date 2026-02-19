import { isNumber } from '@sisense/sdk-data';

import { TableDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { createCompareValue } from '@/domains/visualizations/core/chart-data-processor/row-comparator';
import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config';

export const formatNumbers = (
  table: DataTable,
  chartDataOptions: TableDataOptionsInternal,
): DataTable => {
  // If there are no numberFormatConfigs, there is no formatting to be done
  if (!table.columns.some((c) => isNumber(c.type))) return table;

  // This reads the number format config from chartDataOptions,
  // and apply the format to display value
  const columns = table.columns;
  const rows = table.rows;

  const newRows = rows.map((row) => {
    return row.map((r, index) => {
      const columnType = columns[index].type;

      const numberFormatConfig = getCompleteNumberFormatConfig(
        chartDataOptions.columns[index].numberFormatConfig,
      );
      if (isNumber(columnType)) {
        const compareValue = createCompareValue(r.displayValue, columnType);
        return {
          displayValue: applyFormatPlainText(numberFormatConfig, compareValue.value as number),
          compareValue: compareValue,
        };
      } else {
        return r;
      }
    });
  });

  const newTable: DataTable = { columns, rows: newRows };
  return newTable;
};
