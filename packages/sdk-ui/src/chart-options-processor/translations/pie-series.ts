/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Convolution, SeriesWithAlerts, CompleteThemeSettings, ValueToColorMap } from '../../types';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';
import { SeriesType } from '../chart-options-service';
import { formatSeries, getColorSetting, SeriesPointStructure } from './translations-to-highcharts';
import { PieChartDesignOptions } from './design-options';
import {
  CategoricalChartData,
  CategoricalSeriesValues,
  CategoricalXValues,
} from '../../chart-data/types';
import { seriesSliceWarning } from '../../utils/data-limit-warning';
import { getPaletteColor } from '../../chart-data-options/coloring/utils';

const CONVOLUTION_OTHERS_NAME = 'Other';
const CONVOLUTION_OTHERS_ID = 'Others';
const CONVOLUTION_OTHERS_COLOR = '#525A6B';

type FormattedPieChartData = SeriesWithAlerts<SeriesType[]> & {
  convolutionSeries: SeriesType[];
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
): FormattedPieChartData => {
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
              sliced: v.selected ?? false,
              name: categories[index],
              color:
                getColorSetting(dataOptions, seriesValues[index].name) ??
                getPaletteColor(themeSettings?.palette.variantColors, index),
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
        (dataOptions.seriesToColorMap as ValueToColorMap)?.[c] ??
        getPaletteColor(themeSettings?.palette?.variantColors, i),
    );
    series = chartData.series.map((v: CategoricalSeriesValues) => {
      const { data, ...otherSeriesOptions } = formatSeries(
        v,
        indexMap,
        false,
        categories,
        categoryColors,
      );
      return {
        ...otherSeriesOptions,
        data: data.map((v) => ({
          ...v,
          sliced: v.selected ?? false,
        })),
        boostThreshold: 0,
        turboThreshold: 0,
      };
    });
  }

  const convolution = designOptions?.convolution;

  if (!convolution?.enabled) return { series, alerts, convolutionSeries: [] };

  switch (convolution?.selectedConvolutionType) {
    case 'byPercentage':
      return { ...convolutionByPercentage(series, convolution), alerts };
    case 'bySlicesCount':
      return { ...convolutionBySlicesCount(series, convolution), alerts };
    default:
      return { series, alerts, convolutionSeries: [] };
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

  series[0].data.push({
    y: otherTotal,
    name: CONVOLUTION_OTHERS_NAME,
    color: CONVOLUTION_OTHERS_COLOR,
    sliced: false,
    drilldown: CONVOLUTION_OTHERS_ID,
  });
  return series;
};

const prepareConvolutionContentSeries = (data: SeriesPointStructure[]): SeriesType[] => {
  return [
    {
      name: CONVOLUTION_OTHERS_NAME,
      id: CONVOLUTION_OTHERS_ID,
      data,
    },
  ];
};

const convolutionByPercentage = (series: SeriesType[], convolution: Convolution) => {
  if (convolution?.minimalIndependentSlicePercentage === undefined || series.length === 0) {
    return { series, convolutionSeries: [] };
  }
  const minFraction = convolution.minimalIndependentSlicePercentage / 100.0;

  const total = series[0].data.reduce(sumValues, 0);

  const otherSeriesData = series[0].data.filter((d) => !keepSlice(d, total, minFraction));
  if (otherSeriesData.length === 0) return { series, convolutionSeries: [] };

  series[0].data = series[0].data.filter((d) => keepSlice(d, total, minFraction));

  return {
    series: addOtherToSeries(series, otherSeriesData),
    convolutionSeries: prepareConvolutionContentSeries(otherSeriesData),
  };
};

const convolutionBySlicesCount = (series: SeriesType[], convolution: Convolution) => {
  if (convolution?.independentSlicesCount === undefined) {
    return { series, convolutionSeries: [] };
  }
  const sliceCount = convolution.independentSlicesCount;
  const keepSlices = series[0].data
    .map((d, index) => ({ ...d, index }))
    .sort((a, b) => (b.y ?? 0) - (a.y ?? 0))
    .slice(0, sliceCount);

  const keepSliceHash = Object.fromEntries(keepSlices.map((e) => [e.index, true]));

  const otherSeriesData = series[0].data.filter((_d, index) => !keepSliceHash[index]);

  if (otherSeriesData.length === 0) return { series, convolutionSeries: [] };

  series[0].data = series[0].data.filter((_d, index) => keepSliceHash[index]);

  return {
    series: addOtherToSeries(series, otherSeriesData),
    convolutionSeries: prepareConvolutionContentSeries(otherSeriesData),
  };
};
