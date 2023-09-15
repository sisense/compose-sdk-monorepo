import { DataTable } from '../../../chart-data-processor/table-processor';
import { TableDataOptionsInternal } from '../../../chart-data-options/types';
import { isNumber } from '@sisense/sdk-data';
import { createCompareValue } from '../../../chart-data-processor/row-comparator';
import { applyFormatPlainText } from '../../../chart-options-processor/translations/number-format-config';

export const formatNumbers = (
  table: DataTable,
  chartDataOptions: TableDataOptionsInternal,
): DataTable => {
  // If there are no numberFormatConfigs, there is no formatting to be done
  if (!chartDataOptions.columns.some((c) => c.numberFormatConfig)) return table;

  // This reads the number format config from chartDataOptions,
  // and apply the format to display value
  const columns = table.columns;
  const rows = table.rows;

  const newRows = rows.map((row) => {
    return row.map((r, index) => {
      const columnType = columns[index].type;

      const numberConfig = chartDataOptions.columns[index].numberFormatConfig;
      if (isNumber(columnType) && numberConfig) {
        const compareValue = createCompareValue(r.displayValue, columnType);
        return {
          displayValue: applyFormatPlainText(numberConfig, compareValue.value as number),
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
