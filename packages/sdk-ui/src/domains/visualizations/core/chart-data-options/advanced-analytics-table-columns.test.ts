import { createAttribute, measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  withForecastRangeColumns,
  withTrendForecastColumns,
} from './advanced-analytics-table-columns';
import { translateTableDataOptions, withUniqueMeasureNames } from './translate-data-options';
import type { TableDataOptions, TableDataOptionsInternal } from './types';
import { getDataOptionTitle, isDerivedResultColumn } from './utils';

const monthsAttribute = createAttribute({
  name: 'Months',
  type: 'datelevel',
  expression: '[Commerce.Date (Month)]',
});

const countryAttribute = createAttribute({
  name: 'Country',
  type: 'text-attribute',
  expression: '[Commerce.Country]',
});

const revenueMeasure = measureFactory.sum(
  createAttribute({
    name: 'Revenue',
    type: 'numeric-attribute',
    expression: '[Commerce.Revenue]',
  }),
  'Revenue',
);

describe('translateTableDataOptions (trend/forecast expansion) + withForecastRangeColumns', () => {
  it('produces 6 columns for a date dimension plus a trend+forecast measure', () => {
    const dataOptions: TableDataOptions = {
      columns: [
        { column: monthsAttribute, dateFormat: 'yy-MM' },
        {
          column: revenueMeasure,
          trend: { modelType: 'advancedSmoothing' },
          forecast: { modelType: 'auto', forecastHorizon: 6 },
          numberFormatConfig: { name: 'Currency', decimalScale: 2 },
        },
      ],
    };

    const { dataOptions: uniqueNamedOptions } = withUniqueMeasureNames(
      translateTableDataOptions(dataOptions),
    );
    const result = withForecastRangeColumns(uniqueNamedOptions);

    expect(result.columns).toHaveLength(6);
    expect(result.columns.map((c) => getDataOptionTitle(c))).toEqual([
      'Months',
      'Revenue',
      'Revenue Trend',
      'Revenue Forecast',
      'Revenue Forecast Upper Bound',
      'Revenue Forecast Lower Bound',
    ]);

    // numberFormatConfig preserved on every numeric (non-dimension) column
    for (const col of result.columns.slice(1)) {
      expect((col as { numberFormatConfig?: unknown }).numberFormatConfig).toEqual({
        name: 'Currency',
        decimalScale: 2,
      });
    }

    // The band columns have no dimensional Column/Measure identity.
    expect(isDerivedResultColumn(result.columns[4])).toBe(true);
    expect(isDerivedResultColumn(result.columns[5])).toBe(true);
  });

  it('does not synthesize for a plain Fusion MeasureColumn (no dimensional identity), and does not throw', () => {
    const dataOptions: TableDataOptions = {
      columns: [
        { column: { name: 'Revenue', aggregation: 'sum' }, trend: { modelType: 'linear' } },
      ],
    };

    expect(() => translateTableDataOptions(dataOptions)).not.toThrow();
    const result = translateTableDataOptions(dataOptions);
    expect(result.columns).toHaveLength(1);
  });

  it('synthesizes only a Trend companion when only .trend is set', () => {
    const dataOptions: TableDataOptions = {
      columns: [
        { column: monthsAttribute },
        { column: revenueMeasure, trend: { modelType: 'linear' } },
      ],
    };

    const result = translateTableDataOptions(dataOptions);
    expect(result.columns).toHaveLength(3);
    expect(getDataOptionTitle(result.columns[2])).toBe('Revenue Trend');
  });

  it('synthesizes only a Forecast companion when only .forecast is set', () => {
    const dataOptions: TableDataOptions = {
      columns: [
        { column: monthsAttribute },
        { column: revenueMeasure, forecast: { forecastHorizon: 3 } },
      ],
    };

    const result = translateTableDataOptions(dataOptions);
    expect(result.columns).toHaveLength(3);
    expect(getDataOptionTitle(result.columns[2])).toBe('Revenue Forecast');
  });

  it('still synthesizes when multiple dimension columns are present (no shape gate)', () => {
    const dataOptions: TableDataOptions = {
      columns: [
        { column: monthsAttribute },
        { column: countryAttribute },
        { column: revenueMeasure, forecast: { forecastHorizon: 3 } },
      ],
    };

    const result = translateTableDataOptions(dataOptions);
    expect(result.columns).toHaveLength(4);
    expect(getDataOptionTitle(result.columns[3])).toBe('Revenue Forecast');
  });

  it('does not expand trend/forecast when includeTrendAndForecast is false', () => {
    // Regression guard for the narrative path's `includeTrendAndForecast` opt-out
    // (getNarrativeDimensionsAndMeasuresFromTable).
    const dataOptions: TableDataOptions = {
      columns: [
        { column: monthsAttribute },
        {
          column: revenueMeasure,
          trend: { modelType: 'linear' },
          forecast: { forecastHorizon: 3 },
        },
      ],
    };

    const result = translateTableDataOptions(dataOptions, { includeTrendAndForecast: false });
    expect(result.columns).toHaveLength(2);
  });
});

describe('withTrendForecastColumns', () => {
  it('expands a measure column with both .trend and .forecast into base + companions', () => {
    const dataOptions: TableDataOptionsInternal = {
      columns: [
        { column: monthsAttribute },
        {
          column: revenueMeasure,
          trend: { modelType: 'linear' },
          forecast: { forecastHorizon: 3 },
        },
      ],
    };

    const result = withTrendForecastColumns(dataOptions);

    expect(result.columns).toHaveLength(4);
    expect(result.columns.map((c) => getDataOptionTitle(c))).toEqual([
      'Months',
      'Revenue',
      'Revenue Trend',
      'Revenue Forecast',
    ]);
  });

  it('passes non-measure and plain measure columns through unchanged', () => {
    const dataOptions: TableDataOptionsInternal = {
      columns: [{ column: monthsAttribute }, { column: revenueMeasure }],
    };

    const result = withTrendForecastColumns(dataOptions);

    expect(result.columns).toEqual(dataOptions.columns);
  });

  it('does not index a missing companion when the base column is already a trend measure', () => {
    // adaptMeasuresForQuery skips synthesizing a companion when `measure` already is that kind of
    // measure (isTrendMeasure/isForecastMeasure) — this must not push `undefined` as a column.
    const alreadyTrendMeasure = measureFactory.trend(revenueMeasure, '$trend_Revenue', {
      modelType: 'linear',
    });

    const dataOptions: TableDataOptionsInternal = {
      columns: [
        { column: monthsAttribute },
        { column: alreadyTrendMeasure, trend: { modelType: 'linear' } },
      ],
    };

    const result = withTrendForecastColumns(dataOptions);

    expect(result.columns).toHaveLength(2);
    expect(result.columns.every((c) => c !== undefined)).toBe(true);
  });

  it('does not index a missing companion when the base column is already a forecast measure', () => {
    const alreadyForecastMeasure = measureFactory.forecast(revenueMeasure, '$forecast_Revenue', {
      forecastHorizon: 3,
    });

    const dataOptions: TableDataOptionsInternal = {
      columns: [
        { column: monthsAttribute },
        { column: alreadyForecastMeasure, forecast: { forecastHorizon: 3 } },
      ],
    };

    const result = withTrendForecastColumns(dataOptions);

    expect(result.columns).toHaveLength(2);
    expect(result.columns.every((c) => c !== undefined)).toBe(true);
  });
});

describe('withForecastRangeColumns', () => {
  it('appends upper/lower bound columns for a forecast measure, preserving formatting', () => {
    // Simulates the post-alias shape withForecastRangeColumns actually runs against in
    // table-component.tsx: the forecast measure's own name is already the aliased one.
    const forecastMeasure = measureFactory.forecast(revenueMeasure, '$measure1_$forecast_Revenue', {
      forecastHorizon: 3,
    });

    const dataOptions: TableDataOptionsInternal = {
      columns: [
        { column: monthsAttribute },
        {
          column: forecastMeasure,
          name: 'Revenue Forecast',
          numberFormatConfig: { name: 'Currency', decimalScale: 2 },
        },
      ],
    };

    const result = withForecastRangeColumns(dataOptions);

    expect(result.columns).toHaveLength(4);
    expect(result.columns.map((c) => getDataOptionTitle(c))).toEqual([
      'Months',
      'Revenue Forecast',
      'Revenue Forecast Upper Bound',
      'Revenue Forecast Lower Bound',
    ]);

    const [, base, upper, lower] = result.columns;
    expect(isDerivedResultColumn(base)).toBe(false);
    expect(isDerivedResultColumn(upper)).toBe(true);
    expect(isDerivedResultColumn(lower)).toBe(true);
    expect(upper).toMatchObject({
      name: '$measure1_$forecast_Revenue_upper',
      numberFormatConfig: { name: 'Currency', decimalScale: 2 },
    });
    expect(lower).toMatchObject({
      name: '$measure1_$forecast_Revenue_lower',
      numberFormatConfig: { name: 'Currency', decimalScale: 2 },
    });
  });

  it('passes non-forecast columns through unchanged', () => {
    const dataOptions: TableDataOptionsInternal = {
      columns: [{ column: monthsAttribute }, { column: revenueMeasure }],
    };

    const result = withForecastRangeColumns(dataOptions);

    expect(result.columns).toEqual(dataOptions.columns);
  });
});
