import { prepareDataLabelsOptions } from '@/chart-options-processor/series-labels';

import { getPaletteColor } from '../../../chart-data-options/coloring/utils';
import { CartesianChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CategoricalSeriesValues } from '../../../chart-data/types';
import { onlyY } from '../../../chart-data/utils';
import { ChartType, CompleteThemeSettings } from '../../../types';
import { AxisSettings } from '../../translations/axis-section';
import {
  CartesianChartDesignOptions,
  LineChartDesignOptions,
} from '../../translations/design-options';
import { getMarkerSettings } from '../../translations/marker-section';
import { AxisClipped } from '../../translations/translations-to-highcharts';
import {
  formatSeries,
  formatSeriesContinuousXAxis,
  getColorSetting,
  indexMapWhenOnlyY,
} from '../../translations/translations-to-highcharts';
import { ChartDesignOptions, SeriesDesignOptions } from '../../translations/types';
import { createDataLabelsFormatter } from '../../translations/value-label-section';
import { getDateFormatter } from './axis/axis-utils';

/**
 * Configuration for series processing
 */
interface SeriesProcessingConfig {
  chartData: {
    series: CategoricalSeriesValues[];
  };
  chartType: ChartType;
  chartDesignOptions: ChartDesignOptions;
  dataOptions: CartesianChartDataOptionsInternal;
  continuousDatetimeXAxis: boolean;
  indexMap: number[];
  categories: string[];
  treatNullDataAsZeros: boolean;
  yTreatNullDataAsZeros: boolean[];
  yConnectNulls: boolean[];
  yAxisSide: number[];
  yAxisChartType: (string | undefined)[];
  yAxisSettings: AxisSettings[];
  axisClipped: AxisClipped[];
  xAxisSettings: AxisSettings[];
  stacking?: string;
  themeSettings?: CompleteThemeSettings;
  dateFormatter?: (date: Date, format: string) => string;
}

/**
 * Process and format series data for the chart
 */
export function processSeries(config: SeriesProcessingConfig) {
  const {
    chartData,
    chartDesignOptions,
    dataOptions,
    continuousDatetimeXAxis,
    indexMap,
    categories,
    treatNullDataAsZeros,
    yTreatNullDataAsZeros,
    yConnectNulls,
    yAxisSide,
    yAxisChartType,
    yAxisSettings,
    axisClipped,
    xAxisSettings,
    stacking,
    themeSettings,
    dateFormatter,
  } = config;

  const { seriesCapacity } = chartDesignOptions.dataLimits;

  return chartData.series
    .slice(0, seriesCapacity)
    .map((seriesValue: CategoricalSeriesValues, index: number) => {
      const dataOption = getDataOptionForSeries(dataOptions, seriesValue.name);
      const seriesId = dataOption?.column.name;
      const seriesDesignOptions = getSeriesDesignOptions(chartDesignOptions, seriesId);

      const formattedSeriesData = formatSeriesData({
        seriesValue,
        continuousDatetimeXAxis,
        indexMap,
        categories,
        treatNullDataAsZeros,
        yTreatNullDataAsZeros,
        index,
        stacking,
        dataOptions,
        chartDesignOptions,
        xAxisSettings,
        yAxisSettings,
        axisClipped,
        dateFormatter,
      });

      return {
        ...formattedSeriesData,
        showInNavigator: true,
        stickyTracking: false,
        boostThreshold: 0,
        turboThreshold: 0,
        color: getSeriesColor(dataOptions, seriesValue.name, themeSettings, index),
        yAxis: yAxisSide[index],
        ...(yAxisChartType[index] && { type: yAxisChartType[index] }),
        dataLabels: {
          ...prepareDataLabelsOptions(chartDesignOptions.seriesLabels),
          formatter: createDataLabelsFormatter(
            dataOption?.numberFormatConfig,
            chartDesignOptions.seriesLabels,
          ),
        },
        connectNulls: yConnectNulls[index],
        marker: getMarkerSettings(seriesDesignOptions.marker),
        ...(seriesDesignOptions.line?.width !== undefined && {
          lineWidth: seriesDesignOptions.line?.width,
        }),
        ...(seriesDesignOptions.line?.dashStyle !== undefined && {
          dashStyle: seriesDesignOptions.line?.dashStyle,
        }),
        ...(seriesDesignOptions.line?.endCap !== undefined && {
          linecap: seriesDesignOptions.line?.endCap?.toLowerCase(),
        }),
        ...(seriesDesignOptions.line?.shadow !== undefined && {
          shadow: seriesDesignOptions.line?.shadow,
        }),
        ...('itemPadding' in chartDesignOptions &&
          chartDesignOptions.itemPadding !== undefined && {
            pointPadding: chartDesignOptions.itemPadding,
          }),
        ...('groupPadding' in chartDesignOptions &&
          chartDesignOptions.groupPadding !== undefined && {
            groupPadding: chartDesignOptions.groupPadding,
          }),
        ...('borderRadius' in chartDesignOptions &&
          chartDesignOptions.borderRadius !== undefined && {
            borderRadius: chartDesignOptions.borderRadius,
          }),
      };
    });
}

/**
 * Get data option for a specific series
 */
function getDataOptionForSeries(
  dataOptions: CartesianChartDataOptionsInternal,
  seriesName: string,
) {
  return dataOptions.breakBy.length
    ? dataOptions.y[0]
    : dataOptions.y.find(({ column: { name } }) => name === seriesName);
}

/**
 * Get design options for a specific series
 */
function getSeriesDesignOptions(
  chartDesignOptions: ChartDesignOptions,
  seriesId?: string,
): SeriesDesignOptions {
  const cartesianChartDesignOptions = chartDesignOptions as CartesianChartDesignOptions;
  const seriesSpecificDesignOptions = seriesId
    ? cartesianChartDesignOptions.designPerSeries?.[seriesId]
    : undefined;
  return seriesSpecificDesignOptions || chartDesignOptions;
}

/**
 * Get color for a series
 */
function getSeriesColor(
  dataOptions: CartesianChartDataOptionsInternal,
  seriesName: string,
  themeSettings?: CompleteThemeSettings,
  index?: number,
): string | undefined {
  return (
    getColorSetting(dataOptions, seriesName) ??
    getPaletteColor(themeSettings?.palette?.variantColors, index || 0)
  );
}

/**
 * Format series data based on chart configuration
 */
interface FormatSeriesDataConfig {
  seriesValue: CategoricalSeriesValues;
  continuousDatetimeXAxis: boolean;
  indexMap: number[];
  categories: string[];
  treatNullDataAsZeros: boolean;
  yTreatNullDataAsZeros: boolean[];
  index: number;
  stacking?: string;
  dataOptions: CartesianChartDataOptionsInternal;
  chartDesignOptions: ChartDesignOptions;
  xAxisSettings: AxisSettings[];
  yAxisSettings: AxisSettings[];
  axisClipped: AxisClipped[];
  dateFormatter?: (date: Date, format: string) => string;
}

function formatSeriesData(config: FormatSeriesDataConfig) {
  const {
    seriesValue,
    continuousDatetimeXAxis,
    indexMap,
    categories,
    treatNullDataAsZeros,
    yTreatNullDataAsZeros,
    index,
    stacking,
    dataOptions,
    chartDesignOptions,
    xAxisSettings,
    yAxisSettings,
    axisClipped,
    dateFormatter,
  } = config;

  if (continuousDatetimeXAxis) {
    return formatSeriesContinuousXAxis(
      seriesValue,
      indexMap,
      treatNullDataAsZeros || yTreatNullDataAsZeros[index],
      xAxisSettings[0].tickInterval as number,
      chartDesignOptions.dataLimits.categoriesCapacity,
      getDateFormatter(dataOptions.x[0], dateFormatter),
      yAxisSettings[index],
      axisClipped[index],
    );
  }

  if (onlyY(dataOptions) && !stacking) {
    return formatSeries(
      seriesValue,
      indexMapWhenOnlyY(categories, index),
      treatNullDataAsZeros || yTreatNullDataAsZeros[index],
    );
  }

  return formatSeries(seriesValue, indexMap, treatNullDataAsZeros || yTreatNullDataAsZeros[index]);
}

/**
 * Apply additional series configuration based on chart type
 */
export function applySeriesTypeSpecificOptions(
  series: any[],
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
) {
  return series.map((seriesItem) => {
    const additionalOptions: any = {};

    // Add chart type specific configurations
    if (chartType === 'line' && (chartDesignOptions as LineChartDesignOptions).step) {
      additionalOptions.step = (chartDesignOptions as LineChartDesignOptions).step;
    }

    return {
      ...seriesItem,
      ...additionalOptions,
    };
  });
}

export type { SeriesProcessingConfig };
