/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Color, Convolution, SeriesWithAlerts, CompleteThemeSettings } from '../../types';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';
import { DEFAULT_SERIES_COLORS, SeriesType } from '../chart_options_service';
import { formatSeries, getColorSetting, SeriesPointStructure } from './translations_to_highcharts';
import { PieChartDesignOptions } from './design_options';
import {
  CategoricalChartData,
  CategoricalSeriesValues,
  CategoricalXValues,
} from '../../chart-data/types';
import { seriesSliceWarning } from '../../utils/dataLimitWarning';

// Returns a color from the given array based on index.
// If no color supplied, returns a default color.
export const getAPaletteColor = (colors: Color[] | undefined, index: number) => {
  const noNull = colors?.filter((c) => c) as string[];
  return (noNull && noNull[index % noNull.length]) ?? DEFAULT_SERIES_COLORS[index % 10];
};

/**
 * Convert categorical chart data into renderable highcharts pie series.
 *
 * @param chartData
 * @param dataOptions
 * @param designOptions
 * @param themeSettings
 */
export const formatCategoricalChartData = (
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  designOptions: PieChartDesignOptions,
  themeSettings?: CompleteThemeSettings,
): SeriesWithAlerts<SeriesType[]> => {
  const alerts: SeriesWithAlerts<SeriesType[]>['alerts'] = [];
  const { seriesCapacity } = designOptions.dataLimits;

  let series: SeriesType[];
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
      ...formatSeries(v, indexMap, false, categories, categoryColors),
      boostThreshold: 0,
      turboThreshold: 0,
    }));
  }

  const convolution = designOptions?.convolution;

  if (!convolution?.enabled) return { series, alerts };

  switch (convolution?.selectedConvolutionType) {
    case 'byPercentage':
      return { series: convolutionByPercentage(series, convolution), alerts };
    case 'bySlicesCount':
      return { series: convolutionBySlicesCount(series, convolution), alerts };
    default:
      return { series, alerts };
  }
};

const sumValues = (accumulator: number, d: SeriesPointStructure) => {
  return accumulator + (d.y ?? 0);
};

const keepSlice = (d: SeriesPointStructure, total: number, minPercentage: number) =>
  (d.y ?? 0) / total >= minPercentage;

const addOtherToSeries = (series: SeriesType[], otherSeriesData: SeriesPointStructure[]) => {
  const otherTotal = otherSeriesData.reduce((accumulator, d) => {
    return accumulator + (d.y ?? 0);
  }, 0);

  series[0].data.push({ y: otherTotal, name: 'Other', color: '#525A6B' });

  return series;
};

const convolutionByPercentage = (series: SeriesType[], convolution: Convolution) => {
  if (convolution?.minimalIndependentSlicePercentage === undefined) {
    return series;
  }
  const minFraction = convolution.minimalIndependentSlicePercentage / 100.0;

  const total = series[0].data.reduce(sumValues, 0);

  const otherSeriesData = series[0].data.filter((d) => !keepSlice(d, total, minFraction));
  if (otherSeriesData.length === 0) return series;

  series[0].data = series[0].data.filter((d) => keepSlice(d, total, minFraction));
  return addOtherToSeries(series, otherSeriesData);
};

const convolutionBySlicesCount = (series: SeriesType[], convolution: Convolution) => {
  if (convolution?.independentSlicesCount === undefined) {
    return series;
  }
  const sliceCount = convolution.independentSlicesCount;
  const keepSlices = series[0].data
    .map((d, index) => ({ ...d, index }))
    .sort((a, b) => (b.y ?? 0) - (a.y ?? 0))
    .slice(0, sliceCount);

  const keepSliceHash = Object.fromEntries(keepSlices.map((e) => [e.index, true]));

  const otherSeriesData = series[0].data.filter((_d, index) => !keepSliceHash[index]);

  if (otherSeriesData.length === 0) return series;

  series[0].data = series[0].data.filter((_d, index) => keepSliceHash[index]);

  return addOtherToSeries(series, otherSeriesData);
};
