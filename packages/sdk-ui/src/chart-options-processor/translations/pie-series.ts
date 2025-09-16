import { ContextfulTransformer } from '@/utils/utility-types/transformer';
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
import { SeriesPieOptions } from '@sisense/sisense-charts';

const CONVOLUTION_OTHERS_NAME = 'Other';
const CONVOLUTION_OTHERS_ID = 'Others';
const CONVOLUTION_OTHERS_COLOR = '#525A6B';

type FormattedPieChartData = SeriesWithAlerts<SeriesType[]> & {
  convolutionSeries: SeriesPieOptions[];
};

/**
 * Pure function to sum series point values
 */
const sumValues = (accumulator: number, d: SeriesPointStructure): number =>
  accumulator + (d.y ?? 0);

/**
 * Pure function to check if a slice should be kept based on percentage
 */
const keepSliceByPercentage = (
  d: SeriesPointStructure,
  total: number,
  minPercentage: number,
): boolean => (d.y ?? 0) / total >= minPercentage;

/**
 * Pure function to create convolution series data
 */
const createConvolutionSeries = (data: readonly SeriesPointStructure[]): SeriesPieOptions[] => [
  {
    name: CONVOLUTION_OTHERS_NAME,
    id: CONVOLUTION_OTHERS_ID,
    data: [...data] as SeriesPieOptions['data'],
    type: 'pie',
  },
];

/**
 * Pure function to create "Other" slice from aggregated data
 */
const createOtherSlice = (
  otherSeriesData: readonly SeriesPointStructure[],
): SeriesPointStructure => ({
  y: otherSeriesData.reduce(sumValues, 0),
  name: CONVOLUTION_OTHERS_NAME,
  color: CONVOLUTION_OTHERS_COLOR,
  sliced: false,
  drilldown: CONVOLUTION_OTHERS_ID,
});

/**
 * Transformer that applies percentage-based convolution to pie series
 */
const withConvolutionByPercentage: ContextfulTransformer<
  { series: SeriesType[]; convolutionSeries: SeriesPieOptions[] },
  { convolution: Convolution }
> =
  ({ convolution }) =>
  ({ series, convolutionSeries }) => {
    if (convolution?.minimalIndependentSlicePercentage === undefined || series.length === 0) {
      return { series, convolutionSeries };
    }

    const minFraction = convolution.minimalIndependentSlicePercentage / 100.0;
    const total = series[0].data.reduce(sumValues, 0);

    const keepData = series[0].data.filter((d) => keepSliceByPercentage(d, total, minFraction));
    const otherData = series[0].data.filter((d) => !keepSliceByPercentage(d, total, minFraction));

    if (otherData.length === 0) {
      return { series, convolutionSeries };
    }

    const updatedSeries = [
      {
        ...series[0],
        data: [...keepData, createOtherSlice(otherData)],
      },
      ...series.slice(1),
    ];

    return {
      series: updatedSeries,
      convolutionSeries: createConvolutionSeries(otherData),
    };
  };

/**
 * Transformer that applies count-based convolution to pie series
 */
const withConvolutionBySlicesCount: ContextfulTransformer<
  { series: SeriesType[]; convolutionSeries: SeriesPieOptions[] },
  { convolution: Convolution }
> =
  ({ convolution }) =>
  ({ series, convolutionSeries }) => {
    if (convolution?.independentSlicesCount === undefined || series.length === 0) {
      return { series, convolutionSeries };
    }

    const sliceCount = convolution.independentSlicesCount;
    const sortedWithIndex = series[0].data
      .map((d, index) => ({ ...d, index }))
      .sort((a, b) => (b.y ?? 0) - (a.y ?? 0));

    const keepSlices = sortedWithIndex.slice(0, sliceCount);
    const otherSlices = sortedWithIndex.slice(sliceCount);

    if (otherSlices.length === 0) {
      return { series, convolutionSeries };
    }

    const keepIndices = new Set(keepSlices.map((s) => s.index));
    const keepData = series[0].data.filter((_, index) => keepIndices.has(index));
    const otherData = series[0].data.filter((_, index) => !keepIndices.has(index));

    const updatedSeries = [
      {
        ...series[0],
        data: [...keepData, createOtherSlice(otherData)],
      },
      ...series.slice(1),
    ];

    return {
      series: updatedSeries,
      convolutionSeries: createConvolutionSeries(otherData),
    };
  };

/**
 * Pure function that generates alerts for data limit warnings based on series capacity.
 */
export const getPieAlerts = (
  chartData: CategoricalChartData,
  seriesCapacity: number,
): SeriesWithAlerts<SeriesType[]>['alerts'] => {
  const alerts: SeriesWithAlerts<SeriesType[]>['alerts'] = [];

  if (chartData.xAxisCount === 0) {
    if (chartData.series.length > seriesCapacity) {
      alerts.push(seriesSliceWarning(chartData.series.length, seriesCapacity));
    }
  } else {
    if (chartData.xValues.length > seriesCapacity) {
      alerts.push(seriesSliceWarning(chartData.xValues.length, seriesCapacity));
    }
  }

  return alerts;
};

/**
 * Pure function that creates basic pie chart series data from categorical chart data.
 */
const createBasicPieSeries = (
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  seriesCapacity: number,
  themeSettings?: CompleteThemeSettings,
): SeriesType[] => {
  if (chartData.xAxisCount === 0) {
    const seriesValues = chartData.series.slice(0, seriesCapacity);
    const categories = seriesValues.map((s) => s.title ?? s.name);

    return [
      {
        name: '',
        data: seriesValues
          .map(
            (v: CategoricalSeriesValues) =>
              formatSeries(v, [0], false, categories, undefined, true).data,
          )
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
    const categories = chartData.xValues
      .slice(0, seriesCapacity)
      .map((xAxisValue: CategoricalXValues) => xAxisValue.xValues.join(','));
    const indexMap = categories.map((category: string, i: number) => i);
    const categoryColors = categories.map(
      (c, i) =>
        (dataOptions.seriesToColorMap as ValueToColorMap)?.[c] ??
        getPaletteColor(themeSettings?.palette?.variantColors, i),
    );

    return chartData.series.map((v: CategoricalSeriesValues) => {
      const { data, ...otherSeriesOptions } = formatSeries(
        v,
        indexMap,
        false,
        categories,
        categoryColors,
        true,
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
};

/**
 * Creates pie chart series with convolution applied.
 * Returns the complete series ready for chart rendering.
 */
export const getPieSeries = ({
  chartData,
  dataOptions,
  seriesCapacity,
  convolution,
  themeSettings,
}: {
  chartData: CategoricalChartData;
  dataOptions: CategoricalChartDataOptionsInternal;
  seriesCapacity: number;
  convolution?: Convolution;
  themeSettings?: CompleteThemeSettings;
}): SeriesType[] => {
  const basicSeries = createBasicPieSeries(chartData, dataOptions, seriesCapacity, themeSettings);

  if (!convolution?.enabled) {
    return basicSeries;
  }

  const transformer =
    convolution.selectedConvolutionType === 'byPercentage'
      ? withConvolutionByPercentage({ convolution })
      : convolution.selectedConvolutionType === 'bySlicesCount'
      ? withConvolutionBySlicesCount({ convolution })
      : (input: { series: SeriesType[]; convolutionSeries: SeriesType[] }) => input;

  const { series } = transformer({ series: basicSeries, convolutionSeries: [] });
  return series;
};

/**
 * Returns only the convolution series (breakdown of "Others" slice).
 * This is separate data for drill-down functionality.
 */
export const getPieConvolutionSeries = ({
  chartData,
  dataOptions,
  seriesCapacity,
  convolution,
  themeSettings,
}: {
  chartData: CategoricalChartData;
  dataOptions: CategoricalChartDataOptionsInternal;
  seriesCapacity: number;
  convolution?: Convolution;
  themeSettings?: CompleteThemeSettings;
}): SeriesPieOptions[] => {
  if (!convolution?.enabled) {
    return [];
  }

  const basicSeries = createBasicPieSeries(chartData, dataOptions, seriesCapacity, themeSettings);

  const transformer =
    convolution.selectedConvolutionType === 'byPercentage'
      ? withConvolutionByPercentage({ convolution })
      : convolution.selectedConvolutionType === 'bySlicesCount'
      ? withConvolutionBySlicesCount({ convolution })
      : () => ({ series: basicSeries, convolutionSeries: [] });

  const { convolutionSeries } = transformer({ series: basicSeries, convolutionSeries: [] });
  return convolutionSeries;
};

/**
 * Convert categorical chart data into renderable highcharts pie series.
 *
 * @param chartData - The source categorical chart data
 * @param dataOptions - Chart data configuration options
 * @param designOptions - Design and styling options including convolution settings
 * @param themeSettings - Theme configuration for colors and styling
 * @returns Formatted pie chart data with series, alerts, and convolution series
 */
export const formatCategoricalChartData = (
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  designOptions: PieChartDesignOptions,
  themeSettings?: CompleteThemeSettings,
): FormattedPieChartData => {
  const { seriesCapacity } = designOptions.dataLimits;
  const convolution = designOptions?.convolution;

  // Generate alerts using pure function
  const alerts = getPieAlerts(chartData, seriesCapacity);

  // Get final series with convolution applied (if enabled)
  const series = getPieSeries({
    chartData,
    dataOptions,
    seriesCapacity,
    convolution,
    themeSettings,
  });

  // Get separate convolution series for drill-down functionality
  const convolutionSeries = getPieConvolutionSeries({
    chartData,
    dataOptions,
    seriesCapacity,
    convolution,
    themeSettings,
  });

  return {
    series,
    alerts,
    convolutionSeries,
  };
};
