import { useCallback, useMemo } from 'react';
import type { Filter, Column, MeasureColumn, Data } from '@sisense/sdk-data';
import type { StackableStyleOptions, StyledColumn, ValueToColorMap } from '@/types';
import merge from 'deepmerge';
import type { HistogramStyleOptions } from './Histogram';
import { ColumnChart, HighchartsOptions } from '@/index';

export type HistogramChartStyleOptions = HistogramStyleOptions;

export interface HistogramChartDataOptions {
  fequency: MeasureColumn;
  bins: Column;
  breakBy: (Column | StyledColumn)[];
  seriesToColorMap?: ValueToColorMap;
}

export type HistogramChartProps = {
  dataSet: Data;
  dataOptions: HistogramChartDataOptions;
  filters?: Filter[];
  styleOptions?: HistogramChartStyleOptions;
};

export const HistogramChart = ({ dataSet, dataOptions, styleOptions }: HistogramChartProps) => {
  // Widget plug-in render: render chart with histogram data
  const onBeforeRender = useCallback(
    (options: HighchartsOptions) => {
      const plotOptions = {
        plotOptions: {
          column: {
            shadow: false,
            grouping: true,
            borderWidth: 1,
            borderColor: styleOptions?.barBorder ? 'black' : 'white',
            groupPadding: 0,
            pointPadding: 0,
            maxPointWidth: undefined,
          },
        },
      };

      if (styleOptions?.subtype === 'overlay') {
        options.series?.forEach((s) => (s.opacity = 0.5));
        plotOptions.plotOptions.column.grouping = false;
      }

      return merge(options, plotOptions);
    },
    [styleOptions?.barBorder, styleOptions?.subtype],
  );

  const columnStyleOptions = useMemo<StackableStyleOptions>(
    () => ({
      ...styleOptions,
      subtype: styleOptions?.subtype === 'stacked' ? 'column/stackedcolumn' : 'column/classic',
    }),
    [styleOptions],
  );

  const columnChartDataOptions = useMemo(
    () => ({
      category: [dataOptions.bins],
      value: [dataOptions.fequency],
      breakBy: dataOptions.breakBy,
      seriesToColorMap: dataOptions.seriesToColorMap,
    }),
    [dataOptions],
  );

  return (
    <ColumnChart
      dataSet={dataSet}
      dataOptions={columnChartDataOptions}
      onBeforeRender={onBeforeRender}
      styleOptions={columnStyleOptions}
    />
  );
};
