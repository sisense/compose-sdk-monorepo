/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines-per-function */
import { Color, SeriesWithAlerts, CompleteThemeSettings } from '../../types';
import { DEFAULT_SERIES_COLORS, SeriesType } from '../chart_options_service';
import {
  formatSeries,
  getColorSetting,
  HighchartsSeriesValues,
  SeriesPointStructure,
} from './translations_to_highcharts';
import { FunnelChartDesignOptions } from './design_options';
import {
  CategoricalChartData,
  CategoricalSeriesValues,
  CategoricalXValues,
} from '../../chart-data/types';
import { fromFraction } from '../../chart-data/utils';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';
import { seriesSliceWarning } from '../../utils/dataLimitWarning';

// Returns a color from the given array based on index.
// If no color supplied, returns a default color.
export const getAPaletteColor = (colors: Color[] | undefined, index: number) => {
  const noNull = colors?.filter((c) => c) as string[];
  return (noNull && noNull[index % noNull.length]) ?? DEFAULT_SERIES_COLORS[index % 10];
};

// TODO refactor pie_series.ts and funnel_series.ts to handle both pie and funnel charts

/**
 * Convert categorical chart data into renderable highcharts funnel series. *
 *
 * @param chartData
 * @param dataOptions
 * @param designOptions
 * @param themeSettings
 */
export const formatFunnelChartData = (
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  designOptions: FunnelChartDesignOptions,
  themeSettings?: CompleteThemeSettings,
): SeriesWithAlerts<SeriesType[]> => {
  let series: SeriesType[];
  const alerts: SeriesWithAlerts<SeriesType[]>['alerts'] = [];
  const { seriesCapacity } = designOptions.dataLimits;

  if (chartData.xAxisCount === 0) {
    if (chartData.series.length > seriesCapacity) {
      alerts.push(seriesSliceWarning(chartData.series.length, seriesCapacity));
    }

    const seriesValues = chartData.series.slice(0, seriesCapacity);
    const categories = seriesValues.map((s) => s.title ?? s.name);

    series = [
      {
        name: '',
        data: seriesValues
          .map((v: CategoricalSeriesValues) => formatSeries(v, [0], false, categories).data)
          .flat()
          .map((v, index) => {
            return {
              ...v,
              name: categories[index],
              color:
                getColorSetting(dataOptions, seriesValues[index].name) ??
                getAPaletteColor(themeSettings?.palette.variantColors, index),
            };
          }),
        boostThreshold: 0,
        turboThreshold: 0,
      },
    ];

    computeFunnelPercents(series[0]);
  } else {
    if (chartData.xValues.length > seriesCapacity) {
      alerts.push(seriesSliceWarning(chartData.xValues.length, seriesCapacity));
    }

    const categories = chartData.xValues
      .slice(0, seriesCapacity)
      .map((xAxisValue: CategoricalXValues) => xAxisValue.xValues.join(','));
    const indexMap = categories.map((category: string, i: number) => i);
    const categoryColors = categories.map(
      (c, i) =>
        dataOptions.seriesToColorMap?.[c] ??
        getAPaletteColor(themeSettings?.palette?.variantColors, i),
    );

    series = chartData.series.map((v: CategoricalSeriesValues) => ({
      ...computeFunnelPercents(formatSeries(v, indexMap, false, categories, categoryColors)),
      boostThreshold: 0,
      turboThreshold: 0,
    }));
  }

  return { series, alerts };
};

const computeFunnelPercents = (seriesValues: HighchartsSeriesValues): HighchartsSeriesValues => {
  let baseY = 0;
  const data = seriesValues.data.map((value: SeriesPointStructure, index: number) => {
    const y = value.y as number;
    if (index === 0) baseY = y;
    value.custom = { number1: fromFraction(baseY, y) };
    return value;
  });

  return {
    ...seriesValues,
    data,
  };
};
