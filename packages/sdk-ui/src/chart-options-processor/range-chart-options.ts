/* eslint-disable security/detect-object-injection */
/* eslint-disable no-unused-vars */
import { RangeChartData } from '../chart-data/types';
import { ChartDesignOptions } from './translations/types';
import { ChartType, CompleteThemeSettings } from '../types';
import {
  CartesianChartDataOptionsInternal,
  RangeChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../chart-data-options/types';
import { TFunction } from '@sisense/sdk-common';
import { getCartesianChartOptions } from './cartesian-chart-options';
import { SeriesType } from './chart-options-service';
import {
  formatForecastAdjustRangeStart,
  formatForecastPlotBands,
  formatForecastRangeSeries,
  formatForecastSeries,
  isForecastSeries,
} from './advanced-chart-options';
import { getRangeTooltipSettings } from './translations/range/tooltip-range';

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
  const lowerValues: StyledMeasureColumn[] = [];
  const upperValues: StyledMeasureColumn[] = [];

  const upperIndex = 1;
  const lowerIndex = 0;

  dataOptions.seriesValues.forEach((v) => {
    upperValues.push(v);
    lowerValues.push(v);
  });
  dataOptions.rangeValues.forEach(([lower, upper]) => {
    upperValues.push(upper);
    lowerValues.push(lower);
  });

  // contains upper of rangeValues and all series values
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
    translate,
    themeSettings,
    dateFormatter,
  );
  const upperSeriesDataLookup: {
    [x: string]: SeriesType;
  } = {};
  baseChartOptionsUpper.options.series.forEach((s) => {
    upperSeriesDataLookup[s.name] = s;
  });

  // contains lower of rangeValues and all series values
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
    translate,
    themeSettings,
    dateFormatter,
  );
  const lowerSeriesDataLookup: {
    [x: string]: SeriesType;
  } = {};
  baseChartOptionsLower.options.series.forEach((s) => {
    lowerSeriesDataLookup[s.name] = s;
  });

  // Calculate the combined min and max values for the yAxis
  let minVal = Infinity;
  let maxVal = -Infinity;

  // if forecast chart, find index of forecast start
  let forecastStartIndex = -1;
  let lastTickIndex = 0;

  baseChartOptionsUpper.options.series.forEach((s, sIndex) => {
    if (dataOptions.breakBy.length === 0 && sIndex < dataOptions.seriesValues.length) {
      // for combo and forecast charts (no break by allowed), process regular series
      if (isForecastSeries(s.name)) {
        forecastStartIndex = formatForecastSeries(s, lowerSeriesDataLookup, upperSeriesDataLookup);
      }
      s.zIndex = 1;
      s.data.forEach((d) => {
        // Combine data from both upper and lower series
        if (d.y && d.y < minVal) minVal = d.y;
        if (d.y && d.y > maxVal) maxVal = d.y;
      });
    } else {
      const lowerSeriesData = lowerSeriesDataLookup[s.name].data;
      s.yAxis = 0; // Assign to the single combined yAxis
      let rangeIndex = 0;
      if (dataOptions.breakBy.length === 0) {
        rangeIndex = sIndex - dataOptions.seriesValues.length;
      }
      const rangeValue = dataOptions.rangeValues[rangeIndex];
      // skip past $measure prefix
      const nameStartIndex = rangeValue[0].column.name.indexOf('_') + 1;
      const upperPointName = rangeValue[upperIndex].column.name.substring(nameStartIndex);
      const lowerPointName = rangeValue[lowerIndex].column.name.substring(nameStartIndex);

      s.type = 'arearange';
      if (isForecastSeries(s.name)) {
        formatForecastRangeSeries(s, lowerSeriesDataLookup);
      }

      lastTickIndex = Math.max(s.data.length, lastTickIndex);
      s.data = s.data.map((d, index) => {
        const point = {
          ...d,
          low: lowerSeriesData[index].y,
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

      if (isForecastSeries(s.name)) {
        formatForecastAdjustRangeStart(s, lowerSeriesDataLookup);
      }
    }
  });

  if (!baseChartOptionsUpper.options.xAxis) {
    baseChartOptionsUpper.options.xAxis = [];
  }

  // TODO: what if 0?
  if (forecastStartIndex > 0) {
    formatForecastPlotBands(baseChartOptionsUpper.options.xAxis, forecastStartIndex, lastTickIndex);
  }

  if (chartType === 'arearange' && chartDesignOptions.lineType === 'smooth') {
    const areaSplineRangeType = 'areasplinerange' as ChartType;
    baseChartOptionsUpper.options.chart.type = areaSplineRangeType;
    if (baseChartOptionsUpper.options.navigator?.series) {
      baseChartOptionsUpper.options.navigator.series.type = areaSplineRangeType;
    }
  }

  if (chartType === 'arearange') {
    baseChartOptionsUpper.options.tooltip = getRangeTooltipSettings(false, dataOptions, translate);
  }

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
