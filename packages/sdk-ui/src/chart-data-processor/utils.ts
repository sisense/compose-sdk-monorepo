import { ChartType } from '@/types';
import { DataTable } from '@/chart-data-processor/table-processor';
import { isNotAvailable } from '@/utils/not-available-value';

/**
 * List of charts that support visualization of 'N/A' values
 */
const NASupportedCharts: ChartType[] = ['indicator'];

/**
 * Remove rows with 'N/A' values for charts that do not support visualization of this type of value
 *
 * @param chartType - type of chart
 * @param dataTable - Chart data table
 * @returns Chart data table
 */
export function handleNAInTable(chartType: ChartType, dataTable: DataTable) {
  if (NASupportedCharts.includes(chartType)) {
    return dataTable;
  }
  return {
    columns: dataTable.columns,
    rows: dataTable.rows.filter((row) => !row.some((value) => isNotAvailable(value.displayValue))),
  };
}
