/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createAttribute } from '@sisense/sdk-data';

import {
  CategoricalChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../../chart-data-options/types';
import { PlotOptions } from '../chart-options-service';
import { DefaultPieSeriesLabels, DefaultPieType, getPiePlotOptions } from './pie-plot-options';

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
    const piePlotOptions: PlotOptions = getPiePlotOptions(
      DefaultPieType,
      DefaultPieSeriesLabels,
      chartDataOptions,
    );
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
});
