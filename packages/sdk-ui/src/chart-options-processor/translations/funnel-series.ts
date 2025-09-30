/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { SeriesWithAlerts, CompleteThemeSettings, ValueToColorMap } from '../../types';
import { SeriesType } from '../chart-options-service';
import {
  formatSeries,
  getColorSetting,
  HighchartsSeriesValues,
  SeriesPointStructure,
} from './translations-to-highcharts';
import { FunnelChartDesignOptions } from './design-options';
import {
  CategoricalChartData,
  CategoricalSeriesValues,
  CategoricalXValues,
} from '../../chart-data/types';
import { fromFraction } from '../../chart-data/utils';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';
import { getPaletteColor } from '../../chart-data-options/coloring/utils';
import { seriesSliceWarning } from '@/utils/data-limit-warning';

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
  const alerts = getAlerts(chartData, designOptions);
  const { seriesCapacity } = designOptions.dataLimits;

  if (chartData.xAxisCount === 0) {
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
                getPaletteColor(themeSettings?.palette.variantColors, index),
            };
          }),
        boostThreshold: 0,
        turboThreshold: 0,
      },
    ];

    computeFunnelPercents(series[0]);
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

    series = chartData.series.map((v: CategoricalSeriesValues) => ({
      ...computeFunnelPercents(formatSeries(v, indexMap, false, categories, categoryColors)),
      boostThreshold: 0,
      turboThreshold: 0,
    }));
  }

  return { series, alerts };
};

/**
 * Calculate alerts for funnel chart based on data limits.
 *
 * @param chartData - The categorical chart data
 * @param designOptions - The funnel chart design options
 * @returns Array of alert messages
 */
export function getAlerts(
  chartData: CategoricalChartData,
  designOptions: FunnelChartDesignOptions,
): string[] {
  const alerts: string[] = [];
  const { seriesCapacity } = designOptions.dataLimits;

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
}

function computeFunnelPercents(seriesValues: HighchartsSeriesValues): HighchartsSeriesValues {
  let baseY = 0;
  const data = seriesValues.data.map((value: SeriesPointStructure, index: number) => {
    const y = value.y as number;
    if (index === 0) baseY = y;
    value.custom = { ...value.custom, number1: fromFraction(baseY, y) };
    return value;
  });

  return {
    ...seriesValues,
    data,
  };
}
