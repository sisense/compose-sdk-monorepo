import { indicatorData } from './indicator_data';
import { DataTable } from '../chart-data-processor/table_processor';
import { IndicatorDataOptionsInternal } from '../chart-data-options/types';
import { IndicatorChartData } from './types';

describe('indicatorData', () => {
  const dataTable: DataTable = {
    columns: [
      {
        name: 'Total Cost',
        type: 'number',
        index: 0,
        direction: 0,
      },
      {
        name: 'Total Revenue',
        type: 'number',
        index: 1,
        direction: 0,
      },
      {
        name: 'min',
        type: 'number',
        index: 2,
        direction: 0,
      },
      {
        name: 'max',
        type: 'number',
        index: 3,
        direction: 0,
      },
      {
        name: '$rownum',
        type: 'number',
        index: 4,
        direction: 0,
      },
    ],
    rows: [
      [
        {
          displayValue: '107.27',
        },
        {
          displayValue: '38.76',
        },
        {
          displayValue: '0',
        },
        {
          displayValue: '255',
        },
        {
          displayValue: '1',
        },
      ],
    ],
  };

  const indicatorDataOptions: IndicatorDataOptionsInternal = {
    value: [
      {
        name: 'Total Cost',
        aggregation: 'sum',
        numberFormatConfig: {
          name: 'Percent',
          decimalScale: 3,
          trillion: true,
          billion: true,
          million: true,
          kilo: true,
          thousandSeparator: true,
          prefix: true,
          symbol: '',
        },
        title: 'Total Cost',
      },
    ],
    secondary: [
      {
        name: 'Total Revenue',
        aggregation: 'sum',
        title: 'Total Revenue',
      },
    ],
    min: [
      {
        name: 'min',
        aggregation: 'min',
        title: 'Min',
      },
    ],
    max: [
      {
        name: 'max',
        aggregation: 'max',
        title: 'Max',
      },
    ],
  };

  const emptyIndicatorData: IndicatorChartData = { type: 'indicator' };

  it('should return correct chart data for correct dataTable and dataOptions', () => {
    const expectedResult: IndicatorChartData = {
      type: 'indicator',
      value: 107.27,
      secondary: 38.76,
      min: 0,
      max: 255,
    };

    const result: IndicatorChartData = indicatorData(indicatorDataOptions, dataTable);

    expect(result).toEqual(expectedResult);
  });

  it("should return empty chart data when dataOptions for 'value' are not specified", () => {
    const result: IndicatorChartData = indicatorData(
      {
        ...indicatorDataOptions,
        value: undefined,
      },
      dataTable,
    );

    expect(result).toEqual(emptyIndicatorData);
  });

  it("should return empty chart data when in tableData no column with the same name as 'value' in dataOptions", () => {
    const columnsWithBrokenColumnName = [
      {
        name: 'BROKEN_COLUMN_NAME',
        type: 'number',
        index: 0,
        direction: 0,
      },
      ...dataTable.columns.slice(1),
    ];
    const dataTableWithBrokenColumnForValue = {
      ...dataTable,
      columns: columnsWithBrokenColumnName,
    };
    const result: IndicatorChartData = indicatorData(
      indicatorDataOptions,
      dataTableWithBrokenColumnForValue,
    );

    expect(result).toEqual(emptyIndicatorData);
  });
});
