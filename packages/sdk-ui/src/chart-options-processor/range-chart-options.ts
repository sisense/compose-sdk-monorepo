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
  const upperIndex = 1;
  const lowerIndex = 0;

  dataOptions.rangeValues.forEach(([lower, upper]) => {
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
    lowerSeriesDataLookup[s.name] = [...s.data];
  });

  // Calculate the combined min and max values for the yAxis
  let minVal = Infinity;
  let maxVal = -Infinity;

  baseChartOptionsUpper.options.series.forEach((s, sIndex) => {
    const lowerSeries = lowerSeriesDataLookup[s.name];
    type RangeColumn = { column: DimensionalCalculatedMeasure };
    let upperPointName: string;
    let lowerPointName: string;
    let dataOptionsForSeries: RangeColumn[];
    s.yAxis = 0; // Assign to the single combined yAxis
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
      // measure names on tooltip will be min and max
    }

    s.data = s.data.map((d, index) => {
      const point = {
        ...d,
        low: lowerSeries[index].y,
        high: d.y,
        y: undefined,
        upperPointName,
        lowerPointName,
      };
      // Combine data from both upper and lower series
      if (point.low && point.low < minVal) minVal = point.low;
      if (point.high && point.high > maxVal) maxVal = point.high;

      return point;
    });
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

  const [baseYAxisOptions] = baseChartOptionsUpper.options.yAxis ?? [];
  const yAxis = {
    ...baseYAxisOptions,
    min: minVal,
    max: maxVal,
  };

  // Assign the combined yAxis to both series
  baseChartOptionsUpper.options.yAxis = [yAxis];

  return baseChartOptionsUpper;
};
