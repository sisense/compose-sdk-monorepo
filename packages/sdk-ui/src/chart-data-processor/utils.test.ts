import { handleNAInTable } from '@/chart-data-processor/utils';
import { DataTable } from '@/chart-data-processor/table-processor';

describe('handleNAInTable', () => {
  const dataTable = {
    columns: [
      { type: 'number', index: 0, direction: 0, name: 'Units' },
      { type: 'number', index: 1, direction: 0, name: 'Revenue' },
    ],
    rows: [
      [{ displayValue: 10 }, { displayValue: 'N\\A' }],
      [{ displayValue: 'N\\A' }, { displayValue: 20 }],
      [{ displayValue: 30 }, { displayValue: 30 }],
    ],
  } as DataTable;

  it('should return original data table if chart type supports NA', () => {
    const chartType = 'indicator';
    const result = handleNAInTable(chartType, dataTable);
    expect(result).toEqual(dataTable);
  });

  it('should filter out rows with NA values for chart types not supporting NA', () => {
    const chartType = 'line';
    const result = handleNAInTable(chartType, dataTable);
    expect(result).toEqual({
      columns: [
        { type: 'number', index: 0, direction: 0, name: 'Units' },
        { type: 'number', index: 1, direction: 0, name: 'Revenue' },
      ],
      rows: [[{ displayValue: 30 }, { displayValue: 30 }]],
    });
  });
});
