import { RangeChartData } from '../chart-data/types';
import { ChartDesignOptions } from './translations/types';
import { ChartType, CompleteThemeSettings } from '../types';
import {
  CartesianChartDataOptionsInternal,
  RangeChartDataOptionsInternal,
  Value,
} from '../chart-data-options/types';
import { getRangeTooltipSettings } from './translations/range/tooltip-range';
import { TFunction } from '@sisense/sdk-common';
import { getCartesianChartOptions } from './cartesian-chart-options';
import { SeriesPointStructure } from './translations/translations-to-highcharts';
import { DimensionalCalculatedMeasure } from '@sisense/sdk-data';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartType -
 * @param chartDesignOptions -
 * @param dataOptions -
 * @param themeSettings -
 * @param dateFormatter
 */
export const getRangeChartOptions = (
  chartData: RangeChartData,
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: RangeChartDataOptionsInternal,
  translate: TFunction,
  themeSettings?: CompleteThemeSettings,
  dateFormatter?: (date: Date, format: string) => string,
) => {
  const lowerValues: Value[] = [];
  const upperValues: Value[] = [];
  const upperIndex = 0;
  const lowerIndex = 1;

  dataOptions.rangeValues.forEach(([upper, lower]) => {
    upperValues.push(upper);
    lowerValues.push(lower);
  });

  const upperDataOptions = {
    ...dataOptions,
    y: upperValues,
    seriesToColorMap: dataOptions.seriesToColorMap,
  };

  const baseChartOptionsUpper = getCartesianChartOptions(
    {
      ...chartData,
      type: 'cartesian',
    },
    chartType,
    chartDesignOptions,
    upperDataOptions as CartesianChartDataOptionsInternal,
    themeSettings,
    dateFormatter,
  );

  const lowerDataOptions = {
    ...dataOptions,
    y: lowerValues,
    seriesToColorMap: dataOptions.seriesToColorMap,
  };

  const baseChartOptionsLower = getCartesianChartOptions(
    {
      ...chartData.seriesOther,
      type: 'cartesian',
    },
    chartType,
    chartDesignOptions,
    lowerDataOptions as CartesianChartDataOptionsInternal,
    themeSettings,
    dateFormatter,
  );

  const lowerSeriesDataLookup: {
    [x: string]: SeriesPointStructure[];
  } = {};
  baseChartOptionsLower.options.series.forEach((s) => {
    lowerSeriesDataLookup[s.name.replace('Lower', 'Upper')] = [...s.data];
  });

  baseChartOptionsUpper.options.series.forEach((s, sIndex) => {
    const lowerSeries = lowerSeriesDataLookup[s.name];
    type RangeColumn = { column: DimensionalCalculatedMeasure };
    let upperPointName: string;
    let lowerPointName: string;
    let dataOptionsForSeries: RangeColumn[];
    try {
      if (dataOptions.rangeValues.length === 1) {
        dataOptionsForSeries = dataOptions.rangeValues[0] as RangeColumn[] & Value[];
      } else {
        dataOptionsForSeries = dataOptions.rangeValues[sIndex] as unknown as RangeColumn[];
      }
      upperPointName = dataOptionsForSeries[upperIndex].column.name;
      lowerPointName = dataOptionsForSeries[lowerIndex].column.name;
    } catch (error) {
      // Edge case range chart with breakby and multiple range values
    }

    s.data = s.data.map((d, index) => ({
      ...d,
      low: lowerSeries[index].y,
      high: d.y,
      y: undefined,
      upperPointName,
      lowerPointName,
    }));
  });

  if (chartType === 'arearange' && chartDesignOptions.lineType === 'smooth') {
    const areaSplineRangeType = 'areasplinerange' as ChartType;
    baseChartOptionsUpper.options.chart.type = areaSplineRangeType;
    if (baseChartOptionsUpper.options.navigator?.series) {
      baseChartOptionsUpper.options.navigator.series.type = areaSplineRangeType;
    }
  }

  baseChartOptionsUpper.options.tooltip = getRangeTooltipSettings(
    undefined,
    dataOptions,
    translate,
  );

  // merge the yAxis min and max values
  const y1Index = 0;
  const yAxis = baseChartOptionsUpper.options.yAxis ?? [];
  const y1Axis = yAxis[y1Index];
  const y1AxisLower = yAxis[y1Index];

  if (
    y1Axis.min !== null &&
    y1Axis.min !== undefined &&
    y1AxisLower.min !== null &&
    y1AxisLower.min !== undefined
  )
    y1Axis.min = Math.min(y1Axis.min, y1AxisLower.min);
  if (
    y1Axis.max !== null &&
    y1Axis.max !== undefined &&
    y1AxisLower.max !== null &&
    y1AxisLower.max !== undefined
  )
    y1Axis.max = Math.max(y1Axis.max, y1AxisLower.max);

  if (yAxis.length > 1) {
    const y2Index = 1;
    const y2Axis = yAxis[y2Index];
    const y2AxisLower = yAxis[y2Index];
    if (
      y2Axis.min !== null &&
      y2Axis.min !== undefined &&
      y2AxisLower.min !== null &&
      y2AxisLower.min !== undefined
    )
      y2Axis.min = Math.min(y2Axis.min, y2AxisLower.min);
    if (
      y2Axis.max !== null &&
      y2Axis.max !== undefined &&
      y2AxisLower.max !== null &&
      y2AxisLower.max !== undefined
    )
      y2Axis.max = Math.max(y2Axis.max, y2AxisLower.max);
  }
  return baseChartOptionsUpper;
};
