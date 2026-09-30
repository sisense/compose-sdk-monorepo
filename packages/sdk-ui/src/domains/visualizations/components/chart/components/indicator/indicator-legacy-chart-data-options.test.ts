import { createDateDimension, Measure, MeasureColumn, measureFactory } from '@sisense/sdk-data';

import { IndicatorChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { DataColorCondition, DataColorOptions, IndicatorChartDataOptions } from '@/types';

import { chartData, chartDataOptions, chartDesignOptions } from './__mocks__/indicator-mocks.js';
import { createLegacyChartDataOptions } from './indicator-legacy-chart-data-options.js';

/** Builds data options whose value column carries the given color options. */
const withValueColor = (color: DataColorOptions): IndicatorChartDataOptions => ({
  ...chartDataOptions,
  value: [{ column: chartDataOptions.value![0] as MeasureColumn, color }],
});

/** Builds data options whose value column is colored by the given conditions. */
const withConditions = (conditions: DataColorCondition[]): IndicatorChartDataOptions =>
  withValueColor({ type: 'conditional', conditions });

describe('indicator-legacy-chart-data-options', () => {
  describe('createLegacyChartDataOptions', () => {
    it('should return the correct legacy chart data options', () => {
      const legacyChartDataOptions = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        chartDataOptions,
      );
      expect(legacyChartDataOptions).toMatchSnapshot();
    });

    it('should return the correct legacy chart data options when value defined as StyledMeasureColumn', () => {
      const legacyChartDataOptions = createLegacyChartDataOptions(chartData, chartDesignOptions, {
        ...chartDataOptions,
        value: [
          {
            column: chartDataOptions.value![0] as MeasureColumn,
            color: '#FF0000',
          },
        ],
      });
      expect(legacyChartDataOptions).toMatchSnapshot();
    });

    it('should return the correct legacy chart data options when value is "N\\A"', () => {
      const legacyChartDataOptions = createLegacyChartDataOptions(
        { ...chartData, value: NaN },
        chartDesignOptions,
        chartDataOptions,
      );
      expect(legacyChartDataOptions).toMatchSnapshot();
    });
  });

  // The gauge renderer paints one arc per condition, reading each threshold as the numeric `data`
  // key. Without `conditions` on the returned object it falls back to a single-color dial
  describe('conditional value coloring -> gauge dial segments', () => {
    it('reshapes each condition into the `data`/`operator`/`color` triple the renderer reads', () => {
      const { conditions } = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        withConditions([
          { color: '#e74c3c', expression: '25000000', operator: '<' },
          { color: '#4caf50', expression: '25000000', operator: '≥' },
        ]),
      );

      expect(conditions).toEqual([
        { data: 25000000, operator: '<', color: '#e74c3c' },
        { data: 25000000, operator: '≥', color: '#4caf50' },
      ]);
    });

    it('resolves the single value color as well as the segments', () => {
      // The value (~14.48M) satisfies the first condition, so the dial segments and the resolved
      // color are produced from the same conditions but answer different questions.
      const { color, conditions } = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        withConditions([
          { color: '#e74c3c', expression: '25000000', operator: '<' },
          { color: '#4caf50', expression: '25000000', operator: '≥' },
        ]),
      );

      expect(color).toBe('#e74c3c');
      expect(conditions).toHaveLength(2);
    });

    it.each([
      ['<', '<'],
      ['>', '>'],
      ['≤', '≤'],
      ['<=', '<='],
      ['≥', '≥'],
      ['>=', '>='],
      ['=', '='],
      ['≠', '≠'],
      ['!=', '!='],
    ] as const)('passes the "%s" operator through unchanged', (operator, expected) => {
      const { conditions } = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        withConditions([{ color: '#000000', expression: '50', operator }]),
      );

      expect(conditions).toEqual([{ data: 50, operator: expected, color: '#000000' }]);
    });

    it('preserves declaration order, which decides who wins where segments overlap', () => {
      const { conditions } = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        withConditions([
          { color: '#first', expression: '30', operator: '<' },
          { color: '#second', expression: '20', operator: '<' },
          { color: '#third', expression: '10', operator: '<' },
        ]),
      );

      expect(conditions?.map(({ color }) => color)).toEqual(['#first', '#second', '#third']);
    });

    it.each([
      ['is not a number', 'not-a-number'],
      // `Number('')` and `Number('   ')` are both `0`, so a blank threshold would otherwise be
      // coerced into a segment sitting at the dial's origin.
      ['is empty', ''],
      ['is whitespace only', '   '],
    ])('drops a condition whose expression %s', (_case, expression) => {
      const { conditions } = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        withConditions([
          { color: '#kept', expression: '50', operator: '<' },
          { color: '#dropped', expression, operator: '<' },
        ]),
      );

      expect(conditions).toEqual([{ data: 50, operator: '<', color: '#kept' }]);
    });

    it('resolves a formula-driven condition using colorConditionValues from chartData', () => {
      const targetMeasure = { name: 'Target' } as unknown as Measure;
      const { conditions } = createLegacyChartDataOptions(
        { ...chartData, colorConditionValues: { Target: 25000000 } },
        chartDesignOptions,
        withConditions([
          { color: '#e74c3c', expression: '', operator: '<', valueMeasure: targetMeasure },
        ]),
      );

      expect(conditions).toEqual([{ data: 25000000, operator: '<', color: '#e74c3c' }]);
    });

    it('drops a formula-driven condition whose value is missing from colorConditionValues', () => {
      const targetMeasure = { name: 'Target' } as unknown as Measure;
      const { conditions } = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        withConditions([
          { color: '#kept', expression: '50', operator: '<' },
          { color: '#dropped', expression: '', operator: '<', valueMeasure: targetMeasure },
        ]),
      );

      expect(conditions).toEqual([{ data: 50, operator: '<', color: '#kept' }]);
    });

    it('keeps a threshold of zero, which is legitimate rather than blank', () => {
      const { conditions } = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        withConditions([{ color: '#zero', expression: '0', operator: '>' }]),
      );

      expect(conditions).toEqual([{ data: 0, operator: '>', color: '#zero' }]);
    });

    it.each([
      ['no color options', chartDataOptions],
      ['a plain color string', withValueColor('#FF0000')],
      ['uniform color options', withValueColor({ type: 'uniform', color: '#FF0000' })],
      ['an empty condition list', withConditions([])],
    ])('omits `conditions` entirely given %s', (_case, dataOptions) => {
      const legacyChartDataOptions = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        dataOptions,
      );

      expect(legacyChartDataOptions).not.toHaveProperty('conditions');
    });
  });

  describe('date measures', () => {
    const dateDimension = createDateDimension({
      name: 'Date',
      expression: '[Commerce.Date (Calendar)]',
    });
    const maxDate = measureFactory.max(dateDimension.Days, 'Max Date');

    const dateChartData = {
      ...chartData,
      value: Date.UTC(2013, 11, 4),
      valueText: '2013-12-04',
      secondary: Date.UTC(2009, 0, 1),
      secondaryText: '2009-01-01',
      min: Date.UTC(2009, 0, 1),
      minText: '2009-01-01',
      max: Date.UTC(2013, 11, 4),
      maxText: '2013-12-04',
    };

    const dateDataOptions: IndicatorChartDataOptions = {
      ...chartDataOptions,
      value: [maxDate],
    };

    it('renders the value and the secondary from their date text, not from the epoch', () => {
      const result = createLegacyChartDataOptions(
        dateChartData,
        chartDesignOptions,
        dateDataOptions,
      );

      expect(result.value.text).toBe('2013-12-04');
      expect(result.secondary.text).toBe('2009-01-01');
    });

    it('renders the gauge min and max labels from their date text', () => {
      const result = createLegacyChartDataOptions(
        dateChartData,
        chartDesignOptions,
        dateDataOptions,
      );

      expect(result.min.text).toBe('2009-01-01');
      expect(result.max.text).toBe('2013-12-04');
    });

    it('keeps the numeric data of every field as the epoch', () => {
      const result = createLegacyChartDataOptions(
        dateChartData,
        chartDesignOptions,
        dateDataOptions,
      );

      expect(result.value.data).toBe(Date.UTC(2013, 11, 4));
      expect(result.min.data).toBe(Date.UTC(2009, 0, 1));
      expect(result.max.data).toBe(Date.UTC(2013, 11, 4));
    });

    it('labels the gauge bounds from the number when the date bounds are not available', () => {
      const result = createLegacyChartDataOptions(
        {
          ...dateChartData,
          min: NaN,
          minText: 'N\\A',
          max: NaN,
          maxText: 'N\\A',
        },
        chartDesignOptions,
        dateDataOptions,
      );

      expect(result.min.text).toBe('0');
      expect(result.max.text).toBe('100');
    });

    it('still shows the not-available text when the date value is missing', () => {
      const result = createLegacyChartDataOptions(
        { ...dateChartData, value: NaN },
        chartDesignOptions,
        dateDataOptions,
      );

      expect(result.value.text).toBe('#N/A');
    });

    it('skips a color rule on a date measure', () => {
      const result = createLegacyChartDataOptions(dateChartData, chartDesignOptions, {
        ...dateDataOptions,
        value: [{ column: maxDate, color: '#FF0000' }],
      });

      expect(result.color).toBe('#00cee6');
    });

    it('does not warn on a date color rule: createLegacyChartDataOptions runs per render, and indicatorData owns the warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      createLegacyChartDataOptions(dateChartData, chartDesignOptions, {
        ...dateDataOptions,
        value: [{ column: maxDate, color: '#FF0000' }],
      });

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('skips gauge threshold conditions on a date measure', () => {
      const result = createLegacyChartDataOptions(dateChartData, chartDesignOptions, {
        ...dateDataOptions,
        value: [
          {
            column: maxDate,
            color: {
              type: 'conditional',
              conditions: [{ color: '#e74c3c', expression: '25000000', operator: '<' }],
            },
          },
        ],
      });

      expect(result.conditions).toBeUndefined();
    });

    const gaugeDesignOptions: IndicatorChartDesignOptions = {
      ...chartDesignOptions,
      indicatorType: 'gauge',
      skin: 1,
    };
    const numericDesignOptions = (
      numericSubtype: 'numericSimple' | 'numericBar',
    ): IndicatorChartDesignOptions => ({
      ...chartDesignOptions,
      indicatorType: 'numeric',
      numericSubtype,
      skin: 'vertical',
    });

    it.each([
      ['gauge', gaugeDesignOptions],
      ['numericSimple', numericDesignOptions('numericSimple')],
      ['numericBar', numericDesignOptions('numericBar')],
      ['ticker', { ...gaugeDesignOptions, forceTickerView: true }],
    ])(
      'returns the date text as value.text and secondary.text for the %s indicator type',
      (_indicatorType, designOptions) => {
        const result = createLegacyChartDataOptions(dateChartData, designOptions, dateDataOptions);

        expect(result.value.text).toBe('2013-12-04');
        expect(result.secondary.text).toBe('2009-01-01');
      },
    );

    it('keeps coloring a numeric measure', () => {
      const result = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        withValueColor('#FF0000'),
      );

      expect(result.color).toBe('#FF0000');
    });
  });
});
