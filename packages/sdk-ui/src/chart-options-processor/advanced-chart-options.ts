import { Measure, measureFactory } from '@sisense/sdk-data';

import { isCategoryStyle, isStyledColumn } from '@/chart-data-options/utils';

import { CartesianChartDataOptions, StyledMeasureColumn } from '..';
import { SeriesType } from './chart-options-service';
import { AxisPlotBand, AxisSettings } from './translations/axis-section';

export const FORECAST_PREFIX = '$forecast';
export const TREND_PREFIX = '$trend';

export const isForecastSeries = (name: string) => name.startsWith(FORECAST_PREFIX);
export const isTrendSeries = (name: string) => name.startsWith(TREND_PREFIX);

export const rangeTitle = (title: string) => `${title} $range`;

export const formatForecastSeries = (
  s: SeriesType,
  lowerSeriesHash: {
    [x: string]: SeriesType;
  },
  upperSeriesHash: {
    [x: string]: SeriesType;
  },
) => {
  if (!s?.data) return -1;
  const upperSeries = upperSeriesHash[rangeTitle(s.name)];
  const lowerSeries = lowerSeriesHash[rangeTitle(s.name)];
  const measureName = s.name.substring(FORECAST_PREFIX.length + 1);
  const measure = lowerSeriesHash[measureName];
  const startIndex = s.data.findIndex((d) => !isNaN(d?.y || NaN));
  if (startIndex === -1) {
    console.debug('Forecast data has no valid data points', s.name, s.data);
    return -1;
  }
  s.type = 'line';
  s.showInLegend = false;
  s.data[startIndex - 1].y = measure.data[startIndex - 1].y;
  s.dashStyle = 'ShortDash';
  s.color = measure.color;
  s.data.forEach((d, index) => {
    d.high = upperSeries.data[index].y;
    d.low = lowerSeries.data[index].y;
  });
  return startIndex;
};

export const formatForecastRangeSeries = (
  s: SeriesType,
  seriesHash: {
    [x: string]: SeriesType;
  },
) => {
  s.showInLegend = false;
  s.enableMouseTracking = false;
  const measureName = s.name.substring(FORECAST_PREFIX.length + 1, s.name.length - 7);
  const measure = seriesHash[measureName];
  s.color = measure.color;
  s.fillOpacity = 0.15;
  s.lineWidth = 0.0;
};

export const formatForecastAdjustRangeStart = (
  s: SeriesType,
  seriesHash: {
    [x: string]: SeriesType;
  },
) => {
  if (!s.data) return;
  const measureName = s.name.substring(10, s.name.length - 7);
  const measure = seriesHash[measureName];
  const startIndex = s.data.findIndex((d) => !isNaN(d?.low || NaN));
  if (startIndex === -1) {
    console.debug('Forecast range data has no valid data points', s.name, s.data);
    return;
  }
  s.data[startIndex - 1].low = measure.data[startIndex - 1].y;
  s.data[startIndex - 1].high = measure.data[startIndex - 1].y;
};

export const formatForecastPlotBands = (
  xAxis: AxisSettings[],
  forecastStartIndex: number,
  lastTickIndex: number,
) => {
  xAxis.forEach(
    (x) =>
      (x.plotBands = [
        {
          color: '#F7F7FA',
          borderWidth: 0,
          from: forecastStartIndex - 1,
          to: lastTickIndex,
        } as AxisPlotBand,
      ]),
  );
};

export const formatTrendSeries = (
  series: SeriesType,
  seriesHash: {
    [x: string]: SeriesType;
  },
) => {
  series.type = 'line';
  const measureName = series.name.substring(TREND_PREFIX.length + 1);
  const measure = seriesHash[measureName];
  series.showInLegend = false;
  series.dashStyle = 'ShortDot';
  series.color = measure.color;

  let highestValue = 0;
  let lowestValue = Number.MAX_VALUE;

  const trendDataValues: number[] = measure.data
    .filter((dataPoint) => dataPoint.y)
    .map((dataPoint) => {
      highestValue = Math.max(highestValue, dataPoint.y || 0);
      lowestValue = Math.min(lowestValue, dataPoint.y || 0);
      return dataPoint.y!;
    });

  // if (trendDataValues.length === 0) {
  //   console.warn('No valid data points available to calculate trend data.');
  //   return;
  // }

  // Calculate the min, max, average, and median
  const min = lowestValue; // lowest value of the series
  const max = highestValue; // highest value of the series
  const average = trendDataValues.reduce((acc, val) => acc + val, 0) / trendDataValues.length; // average value of the series

  const sortedData = [...trendDataValues].sort((a, b) => a - b);
  const middle = Math.floor(sortedData.length / 2);
  const median =
    sortedData.length % 2 !== 0
      ? sortedData[middle]
      : (sortedData[middle - 1] + sortedData[middle]) / 2;

  const trendData = {
    min,
    max,
    median,
    average,
  };

  // Apply trend data to each data point
  series.data.forEach((dataPoint) => {
    dataPoint.trend = trendData;
  });

  // this line is causing issues in tooltip as tooltip finds dataOption through name and name is changed here
  // this line mainly makes the legend name to include the addition trend information
  // measure.name = `${measure.name} (+${translate('advanced.tooltip.trend')})`;
};

export const formatAdvancedAnalyticsSeries = (series: SeriesType[]) => {
  // post process advanced analytics
  const seriesDataLookup: {
    [x: string]: SeriesType;
  } = {};
  series.forEach((s) => {
    seriesDataLookup[s.name] = s;
  });

  series.forEach((s) => {
    if (isTrendSeries(s.name)) {
      formatTrendSeries(s, seriesDataLookup);
    }
  });
};

/**
 * Validates if the data options are suitable for advanced analytics (trend or forecast).
 *
 * @param dataOptions - The Cartesian chart data options.
 * @returns True if valid, false otherwise.
 */
const isValidForAdvancedAnalytics = (dataOptions: CartesianChartDataOptions): boolean => {
  const { breakBy } = dataOptions;
  if (breakBy.length > 0) {
    return false;
  }

  const enabledCategories = dataOptions.category.filter((c) => !('enabled' in c) || c.enabled);

  if (enabledCategories.length !== 1) {
    return false;
  }

  const [category] = enabledCategories;
  let isCategoryDateLevel = false;
  if (isStyledColumn(category)) {
    isCategoryDateLevel = category.column.type === 'datelevel';
  } else if (isCategoryStyle(category)) {
    isCategoryDateLevel = category.type === 'datelevel';
  }

  return isCategoryDateLevel;
};

/**
 * Extracts trend measures from data options if applicable.
 *
 * @param dataOptions - The Cartesian chart data options.
 * @returns An array of trend measures.
 * @internal
 */
export const extractTrendMeasures = (
  dataOptions: CartesianChartDataOptions,
): StyledMeasureColumn[] => {
  if (!isValidForAdvancedAnalytics(dataOptions)) {
    return [];
  }

  return dataOptions.value
    .filter(
      (measure): measure is StyledMeasureColumn =>
        (measure as StyledMeasureColumn)?.trend !== undefined,
    )
    .map((measure) => {
      return {
        column: measureFactory.trend(
          measure.column as Measure,
          `${TREND_PREFIX}_${measure.column.name}`,
          measure.trend,
        ),
        numberFormatConfig: measure.numberFormatConfig,
      };
    });
};

/**
 * Extracts forecast measures from data options if applicable.
 *
 * @param dataOptions - The Cartesian chart data options.
 * @returns An array of forecast measures.
 * @internal
 */
export const extractForecastMeasures = (
  dataOptions: CartesianChartDataOptions,
): StyledMeasureColumn[] => {
  if (!isValidForAdvancedAnalytics(dataOptions)) {
    return [];
  }

  return dataOptions.value
    .filter(
      (measure): measure is StyledMeasureColumn =>
        (measure as StyledMeasureColumn)?.forecast !== undefined,
    )

    .map((measure) => {
      return {
        column: measureFactory.forecast(
          measure.column as Measure,
          `${FORECAST_PREFIX}_${measure.column.name}`,
          measure.forecast,
        ),
        numberFormatConfig: measure.numberFormatConfig,
      };
    });
};
