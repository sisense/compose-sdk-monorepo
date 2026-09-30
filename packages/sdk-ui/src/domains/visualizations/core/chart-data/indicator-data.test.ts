import { createDateDimension, type Data, measureFactory } from '@sisense/sdk-data';

import { IndicatorChartDataOptionsInternal } from '../chart-data-options/types';
import { normalizeMeasureColumn } from '../chart-data-options/utils';
import { createDataTableFromData } from '../chart-data-processor/table-creators';
import { DataTable } from '../chart-data-processor/table-processor';
import { filterAndAggregateChartData } from './filter-and-aggregate-chart-data';
import { indicatorData } from './indicator-data.js';
import { IndicatorChartData } from './types.js';

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

  const indicatorChartDataOptions: IndicatorChartDataOptionsInternal = {
    value: [
      {
        column: {
          name: 'Total Cost',
          aggregation: 'sum',
          title: 'Total Cost',
        },
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
      },
    ],
    secondary: [
      {
        column: {
          name: 'Total Revenue',
          aggregation: 'sum',
          title: 'Total Revenue',
        },
      },
    ],
    min: [
      {
        column: {
          name: 'min',
          aggregation: 'min',
          title: 'Min',
        },
      },
    ],
    max: [
      {
        column: {
          name: 'max',
          aggregation: 'max',
          title: 'Max',
        },
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

    const result: IndicatorChartData = indicatorData(indicatorChartDataOptions, dataTable);

    expect(result).toEqual(expectedResult);
  });

  it("should return empty chart data when dataOptions for 'value' are not specified", () => {
    const result: IndicatorChartData = indicatorData(
      {
        ...indicatorChartDataOptions,
        value: undefined,
      },
      dataTable,
    );

    expect(result).toEqual(emptyIndicatorData);
  });

  it('should resolve colorConditionMeasures values into colorConditionValues', () => {
    const result = indicatorData(
      {
        ...indicatorChartDataOptions,
        colorConditionMeasures: [
          {
            column: {
              name: 'Total Revenue',
              aggregation: 'sum',
              title: 'Total Revenue',
            },
          },
        ],
      },
      dataTable,
    );

    expect(result.colorConditionValues).toEqual({ 'Total Revenue': 38.76 });
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
      indicatorChartDataOptions,
      dataTableWithBrokenColumnForValue,
    );

    expect(result).toEqual(emptyIndicatorData);
  });

  describe('date measures', () => {
    const dateDimension = createDateDimension({
      name: 'Date',
      expression: '[Commerce.Date (Calendar)]',
    });

    const dateColumn = (name: string, index: number) => ({
      name,
      type: 'datetime',
      index,
      direction: 0,
    });

    const dateDataTable: DataTable = {
      columns: [
        dateColumn('Max Date', 0),
        dateColumn('Min Date', 1),
        dateColumn('Range Start', 2),
        dateColumn('Range End', 3),
        { name: '$rownum', type: 'number', index: 4, direction: 0 },
      ],
      rows: [
        [
          { displayValue: '2013-12-04' },
          { displayValue: '2009-01-01' },
          { displayValue: '2009-01-01' },
          { displayValue: '2013-12-04' },
        ],
      ],
    };

    const dateMeasure = (name: string) =>
      normalizeMeasureColumn(measureFactory.max(dateDimension.Days, name));

    const dateDataOptions: IndicatorChartDataOptionsInternal = {
      value: [dateMeasure('Max Date')],
      secondary: [dateMeasure('Min Date')],
      min: [dateMeasure('Range Start')],
      max: [dateMeasure('Range End')],
    };

    it('carries the display text of every date option alongside the numeric value', () => {
      const result = indicatorData(dateDataOptions, dateDataTable);

      expect(result.valueText).toBe('2013-12-04');
      expect(result.secondaryText).toBe('2009-01-01');
      expect(result.minText).toBe('2009-01-01');
      expect(result.maxText).toBe('2013-12-04');
    });

    it('keeps the numeric value as the epoch, so gauge geometry still works', () => {
      const result = indicatorData(dateDataOptions, dateDataTable);

      expect(result.value).toBe(Date.UTC(2013, 11, 4));
      expect(result.min).toBe(Date.UTC(2009, 0, 1));
      expect(result.max).toBe(Date.UTC(2013, 11, 4));
    });

    it('carries no display text for a numeric measure', () => {
      const result = indicatorData(indicatorChartDataOptions, dataTable);

      expect(result.valueText).toBeUndefined();
      expect(result.secondaryText).toBeUndefined();
      expect(result.minText).toBeUndefined();
      expect(result.maxText).toBeUndefined();
    });

    it('warns when a color rule is configured on a date measure', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      indicatorData(
        {
          ...dateDataOptions,
          value: [{ ...dateMeasure('Max Date'), color: '#FF0000' }],
        },
        dateDataTable,
      );

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toMatch(/date/i);
      warn.mockRestore();
    });

    it('does not warn when a date measure carries no color rule', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      indicatorData(dateDataOptions, dateDataTable);

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('does not warn for a color rule on a numeric measure', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      indicatorData(
        {
          ...indicatorChartDataOptions,
          value: [{ ...indicatorChartDataOptions.value![0], color: '#FF0000' }],
        },
        dataTable,
      );

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('maps an unavailable date cell to NaN instead of passing the not-available string through', () => {
      const unavailable: DataTable = {
        ...dateDataTable,
        rows: [[{ displayValue: 'N\\A' }, ...dateDataTable.rows[0].slice(1)]],
      };

      const result = indicatorData(dateDataOptions, unavailable);

      expect(typeof result.value).toBe('number');
      expect(Number.isNaN(result.value)).toBe(true);
    });

    it('carries no display text for an unavailable date cell', () => {
      const unavailable: DataTable = {
        ...dateDataTable,
        rows: [[{ displayValue: 'N\\A' }, ...dateDataTable.rows[0].slice(1)]],
      };

      expect(indicatorData(dateDataOptions, unavailable).valueText).toBeUndefined();
    });

    it('skips color condition values when the value measure is a date', () => {
      const result = indicatorData(
        {
          ...dateDataOptions,
          colorConditionMeasures: [dateMeasure('Min Date')],
        },
        dateDataTable,
      );

      expect(result.colorConditionValues).toBeUndefined();
    });
  });
});

describe('a date measure on the explicit Data path', () => {
  const dateDimension = createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
  });

  // What the date-format pass leaves behind: `text` is what the user sees, `data` the engine value.
  // Explicit `Data` is then aggregated, which a data source never is.
  const sourceData = (text: string, type = 'datetime') => ({
    columns: [
      { name: 'Category', type: 'string' },
      { name: 'Max Date', type },
    ],
    rows: [
      [
        { data: 'A', text: 'A' },
        { data: '2009-12-31T00:00:00', text },
      ],
    ],
  });

  const aggregate = (data: Data) =>
    filterAndAggregateChartData(
      createDataTableFromData(data),
      [{ name: 'Category', type: 'string' }],
      [{ name: 'Max Date', aggregation: 'max' }],
    );

  const valueTextOf = (level: 'Days' | 'Months' | 'Years' | 'Quarters' | 'Weeks', text: string) => {
    const options: IndicatorChartDataOptionsInternal = {
      value: [normalizeMeasureColumn(measureFactory.max(dateDimension[level], 'Max Date'))],
    };

    return indicatorData(options, aggregate(sourceData(text))).valueText;
  };

  it.each([
    ['Days', '2009-12-31'],
    ['Months', '2009-12'],
    ['Years', '2009'],
    ['Quarters', '4 2009'],
    ['Weeks', '01 2009'],
  ] as const)('keeps the %s text instead of replacing it with the epoch', (level, text) => {
    expect(valueTextOf(level, text)).toBe(text);
  });

  it('preserves max aggregation values for numeric Data measures', () => {
    const numeric = {
      columns: [
        { name: 'Category', type: 'string' },
        { name: 'Max Date', type: 'number' },
      ],
      rows: [
        [
          { data: 'A', text: 'A' },
          { data: 42, text: '42' },
        ],
      ],
    };
    const options: IndicatorChartDataOptionsInternal = {
      value: [normalizeMeasureColumn({ name: 'Max Date', aggregation: 'max' })],
    };

    expect(indicatorData(options, aggregate(numeric)).value).toBe(42);
  });
});
