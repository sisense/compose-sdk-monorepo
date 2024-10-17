/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PlotOptions } from '../chart-options-service';
import {
  CategoricalChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../../chart-data-options/types';
import { getPiePlotOptions, DefaultPieLabels, DefaultPieType } from './pie-plot-options';
import { createAttribute } from '@sisense/sdk-data';

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
      DefaultPieLabels,
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
            color: '#5b6372',
            fontFamily: 'Open Sans',
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
