/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createAttribute } from '@sisense/sdk-data';

import {
  CategoricalChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../../chart-data-options/types';
import { PlotOptions } from '../chart-options-service.js';
import { DefaultPieSeriesLabels, DefaultPieType, getPiePlotOptions } from './pie-plot-options.js';

describe('getPiePlotOptions', () => {
  it('should return the plotOptions with a formatter', () => {
    const meas = {
      column: {
        name: 'column',
        aggregation: 'sum',
        title: 'column',
      },
      sortType: 'sortNone',
      showOnRightAxis: false,
      enabled: true,
    } as StyledMeasureColumn;
    const category = { column: createAttribute({ name: 'series' }) };

    const chartDataOptions: CategoricalChartDataOptionsInternal = {
      y: [meas],
      breakBy: [category],
    };
    const piePlotOptions: PlotOptions = getPiePlotOptions({
      pieType: DefaultPieType,
      seriesLabels: DefaultPieSeriesLabels,
      chartDataOptions,
    });
    expect(piePlotOptions).toEqual({
      pie: {
        allowPointSelect: false,
        dataLabels: {
          align: 'center',
          enabled: true,
          formatter: expect.any(Function),
          pieMinimumFontSizeToTextLabel: 8,
          showDecimals: false,
          showPercentLabels: true,
          style: {
            fontSize: '13px',
            fontWeight: 'normal',
            pointerEvents: 'none',
            textOutline: 'none',
          },
        },
        innerSize: '0%',
        showInLegend: true,
      },
      series: {
        dataLabels: {
          enabled: true,
        },
      },
    });
  });

  describe('formatter behavior with defaultNumberFormattingEnabled', () => {
    const measureWithoutConfig = {
      column: { name: 'revenue', aggregation: 'sum', title: 'Revenue' },
      sortType: 'sortNone',
      showOnRightAxis: false,
      enabled: true,
    } as StyledMeasureColumn;

    const seriesLabelsWithValue = {
      ...DefaultPieSeriesLabels,
      showCategory: false,
      showValue: true,
    };

    it('should render raw value when defaultNumberFormattingEnabled is false and no explicit config', () => {
      const options = getPiePlotOptions({
        pieType: DefaultPieType,
        seriesLabels: seriesLabelsWithValue,
        chartDataOptions: { y: [measureWithoutConfig], breakBy: [] },
        defaultNumberFormattingEnabled: false,
      });
      const formatter = (options.pie as any) /* PlotOptions.pie.dataLabels.formatter is not typed */
        .dataLabels.formatter;
      const result = formatter.call({
        y: 54321,
        point: { name: 'Cat', y: 54321 },
        series: { name: 'Revenue' },
      });
      expect(result).toContain('54321');
      expect(result).not.toContain('54.32K');
    });

    it('should format value with explicit config when defaultNumberFormattingEnabled is false', () => {
      const measureWithConfig = {
        ...measureWithoutConfig,
        numberFormatConfig: { name: 'Percent', decimalScale: 0 },
      } as StyledMeasureColumn;
      const options = getPiePlotOptions({
        pieType: DefaultPieType,
        seriesLabels: seriesLabelsWithValue,
        chartDataOptions: { y: [measureWithConfig], breakBy: [] },
        defaultNumberFormattingEnabled: false,
      });
      const formatter = (options.pie as any) /* PlotOptions.pie.dataLabels.formatter is not typed */
        .dataLabels.formatter;
      // 42 * 100 = 4,200% — confirms formatting was applied, not raw String(42)
      const result = formatter.call({
        y: 42,
        point: { name: 'Cat', y: 42 },
        series: { name: 'Revenue' },
      });
      expect(result).toContain('4,200%');
    });
  });
});
