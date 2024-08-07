import { TFunction } from '@sisense/sdk-common';
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
  const upperSeries = upperSeriesHash[rangeTitle(s.name)];
  const lowerSeries = lowerSeriesHash[rangeTitle(s.name)];
  const measureName = s.name.substring(FORECAST_PREFIX.length + 1);
  const measure = lowerSeriesHash[measureName];
  const startIndex = s.data.findIndex((d) => !isNaN(d?.y || NaN));
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
  const measureName = s.name.substring(10, s.name.length - 7);
  const measure = seriesHash[measureName];
  const startIndex = s.data.findIndex((d) => !isNaN(d?.low || NaN));
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
  s: SeriesType,
  seriesHash: {
    [x: string]: SeriesType;
  },
  translate: TFunction,
) => {
  const measureName = s.name.substring(TREND_PREFIX.length + 1);
  const measure = seriesHash[measureName];
  s.showInLegend = false;
  s.dashStyle = 'ShortDot';
  s.color = measure.color;
  measure.name = `${measure.name} (+${translate('advanced.tooltip.trend')})`;
};

export const formatAdvancedAnalyticsSeries = (series: SeriesType[], translate: TFunction) => {
  // post process advanced analytics
  const seriesDataLookup: {
    [x: string]: SeriesType;
  } = {};
  series.forEach((s) => {
    seriesDataLookup[s.name] = s;
  });

  series.forEach((s) => {
    if (isTrendSeries(s.name)) {
      formatTrendSeries(s, seriesDataLookup, translate);
    }
  });
};
