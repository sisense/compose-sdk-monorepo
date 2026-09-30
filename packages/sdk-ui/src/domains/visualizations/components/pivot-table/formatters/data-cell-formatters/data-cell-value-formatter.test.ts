import { DateLevels, DimensionalLevelAttribute, measureFactory } from '@sisense/sdk-data';
import { type JaqlPanel } from '@sisense/sdk-pivot-query-client';

import { type PivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/types.js';

import { createDataCellValueFormatter } from './data-cell-value-formatter.js';

describe('createDataCellValueFormatter', () => {
  it('should format data cell value by format from dataOptions', () => {
    const dataOptions = {
      values: [
        {
          numberFormatConfig: {
            name: 'Percent',
            decimalScale: 1,
          },
        },
      ],
    } as PivotTableDataOptions;
    const cell = {
      value: 123.456,
      content: null,
    };
    const jaqlPanelItem = {
      field: {
        index: 0,
      },
    } as JaqlPanel;
    const formatter = createDataCellValueFormatter(dataOptions);

    formatter(cell, {}, {}, jaqlPanelItem);

    expect(cell.content).toBe('12,345.6%');
  });

  it('should format data cell value by default format', () => {
    const dataOptions = {} as PivotTableDataOptions;
    const cell = {
      value: 123.456,
      content: null,
    };
    const jaqlPanelItem = {} as JaqlPanel;
    const formatter = createDataCellValueFormatter(dataOptions);

    formatter(cell, {}, {}, jaqlPanelItem);

    expect(cell.content).toBe('123.46');
  });

  it('should not format data cell value when defaultNumberFormattingEnabled is false and no explicit config', () => {
    const dataOptions = {} as PivotTableDataOptions;
    const cell = { value: 123.456, content: null };
    const jaqlPanelItem = {} as JaqlPanel;
    const formatter = createDataCellValueFormatter(dataOptions, undefined, false);

    formatter(cell, {}, {}, jaqlPanelItem);

    expect(cell.content).toBe('123.456');
  });

  it('should still format data cell value with explicit config when defaultNumberFormattingEnabled is false', () => {
    const dataOptions = {
      values: [{ numberFormatConfig: { name: 'Percent', decimalScale: 1 } }],
    } as PivotTableDataOptions;
    const cell = { value: 123.456, content: null };
    const jaqlPanelItem = { field: { index: 0 } } as JaqlPanel;
    const formatter = createDataCellValueFormatter(dataOptions, undefined, false);

    formatter(cell, {}, {}, jaqlPanelItem);

    expect(cell.content).toBe('12,345.6%');
  });

  describe('date measure cells', () => {
    // the tests run under TZ=utc, so an ISO string with no zone lands on the same calendar day
    const dateFormatter = (date: Date, format: string) =>
      `${format}|${date.toISOString().slice(0, 10)}`;
    const levelAttribute = (granularity: string) =>
      new DimensionalLevelAttribute(granularity, '[Commerce.Date (Calendar)]', granularity);
    // partial on purpose: the formatter reads only field.index and jaql
    const datetimePanelItem = (level: string) =>
      ({ field: { index: 0 }, jaql: { datatype: 'datetime', level } } as JaqlPanel);
    const dateOptions = (dateFormat?: string): PivotTableDataOptions =>
      ({
        values: [
          {
            column: measureFactory.max(levelAttribute(DateLevels.Days), 'Max Date'),
            ...(dateFormat ? { dateFormat } : {}),
          },
        ],
      } as PivotTableDataOptions);

    it('masks a datetime leaf cell instead of running it through the number formatter', () => {
      const cell = { value: '2012-07-11T00:00:00.000', content: null };
      const formatter = createDataCellValueFormatter(dateOptions('yyyy-MM-dd'), dateFormatter);

      formatter(cell, {}, {}, datetimePanelItem('days'));

      expect(cell.content).toBe('yyyy-MM-dd|2012-07-11');
    });

    it.each([
      [DateLevels.Days, 'days', 'yyyy-MM-dd'],
      [DateLevels.Months, 'months', 'yyyy-MM'],
      [DateLevels.Years, 'years', 'yyyy'],
    ])(
      'masks a %s measure with its level default when the option carries no format',
      (granularity, level, expected) => {
        const cell = { value: '2012-07-11T00:00:00.000', content: null };
        const options = {
          values: [{ column: measureFactory.max(levelAttribute(granularity), 'Max Date') }],
        } as PivotTableDataOptions;

        createDataCellValueFormatter(options, dateFormatter)(
          cell,
          {},
          {},
          datetimePanelItem(level),
        );

        expect(cell.content).toBe(`${expected}|2012-07-11`);
      },
    );

    it.each(['SUB_TOTAL', 'GRAND_TOTAL'])('masks a %s cell the same as a leaf cell', (userType) => {
      const cell = { value: '2012-12-31T00:00:00.000', content: null };
      const formatter = createDataCellValueFormatter(dateOptions('yyyy-MM-dd'), dateFormatter);

      formatter(cell, { userType }, { userType }, datetimePanelItem('days'));

      expect(cell.content).toBe('yyyy-MM-dd|2012-12-31');
    });

    it('leaves a null datetime cell empty', () => {
      const cell = { value: null, content: 'stale' };
      const formatter = createDataCellValueFormatter(dateOptions('yyyy-MM-dd'), dateFormatter);

      formatter(cell, {}, {}, datetimePanelItem('days'));

      expect(cell.content).toBe('');
    });

    it('keeps an unparseable value rather than throwing on it', () => {
      const cell = { value: 'not a date at all', content: null };
      const formatter = createDataCellValueFormatter(dateOptions('yyyy-MM-dd'), dateFormatter);

      expect(() => formatter(cell, {}, {}, datetimePanelItem('days'))).not.toThrow();
      expect(cell.content).toBe('not a date at all');
    });

    it('keeps the not-available sentinel rather than masking it', () => {
      const cell = { value: 'N\\A', content: null };
      const formatter = createDataCellValueFormatter(dateOptions('yyyy-MM-dd'), dateFormatter);

      formatter(cell, {}, {}, datetimePanelItem('days'));

      expect(cell.content).toBe('N\\A');
    });

    it('still formats a numeric measure as a number, the control', () => {
      const cell = { value: 123.456, content: null };
      const formatter = createDataCellValueFormatter({} as PivotTableDataOptions, dateFormatter);

      formatter(cell, {}, {}, { field: { index: 0 }, jaql: { datatype: 'numeric' } } as JaqlPanel);

      expect(cell.content).toBe('123.46');
    });
  });

  describe('two date measures in one pivot', () => {
    const dateFormatter = (date: Date, format: string) =>
      `${format}|${date.toISOString().slice(0, 10)}`;
    const levelAttribute = (granularity: string) =>
      new DimensionalLevelAttribute(granularity, '[Commerce.Date (Calendar)]', granularity);
    // partial on purpose: the formatter reads only field.index and jaql
    const panelItemAt = (index: number, level: string) =>
      ({ field: { index }, jaql: { datatype: 'datetime', level } } as JaqlPanel);

    const twoLevelOptions = {
      values: [
        { column: measureFactory.max(levelAttribute(DateLevels.Days), 'Max Day') },
        { column: measureFactory.max(levelAttribute(DateLevels.Years), 'Max Year') },
      ],
    } as PivotTableDataOptions;

    it('keeps each column on its own mask, with no leak from the column beside it', () => {
      // one formatter instance serves every cell, so a cached mask would show up here
      const formatter = createDataCellValueFormatter(twoLevelOptions, dateFormatter);
      const dayCell = { value: '2012-07-11T00:00:00.000', content: null };
      const yearCell = { value: '2012-07-11T00:00:00.000', content: null };

      formatter(dayCell, {}, {}, panelItemAt(0, 'days'));
      formatter(yearCell, {}, {}, panelItemAt(1, 'years'));

      expect(dayCell.content).toBe('yyyy-MM-dd|2012-07-11');
      expect(yearCell.content).toBe('yyyy|2012-07-11');
    });

    it('follows a granularity switch on the same column', () => {
      const cell = { value: '2012-07-11T00:00:00.000', content: null };
      const atDays = {
        values: [{ column: measureFactory.max(levelAttribute(DateLevels.Days), 'Max Date') }],
      } as PivotTableDataOptions;
      const atMonths = {
        values: [{ column: measureFactory.max(levelAttribute(DateLevels.Months), 'Max Date') }],
      } as PivotTableDataOptions;

      createDataCellValueFormatter(atDays, dateFormatter)(cell, {}, {}, panelItemAt(0, 'days'));
      expect(cell.content).toBe('yyyy-MM-dd|2012-07-11');

      createDataCellValueFormatter(atMonths, dateFormatter)(cell, {}, {}, panelItemAt(0, 'months'));
      expect(cell.content).toBe('yyyy-MM|2012-07-11');
    });
  });
});
