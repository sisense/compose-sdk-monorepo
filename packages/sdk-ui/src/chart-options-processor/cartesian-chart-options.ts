/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable max-params */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-lines */
import { CategoricalSeriesValues, ChartData } from '../chart-data/types';
import { ChartDesignOptions, SeriesDesignOptions } from './translations/types';
import { getLegendSettings } from './translations/legend-section';
import {
  createValueLabelFormatter,
  getPolarValueLabelSettings,
  getValueLabelSettings,
} from './translations/value-label-section';
import { getMarkerSettings } from './translations/marker-section';
import {
  getXAxisSettings,
  getYAxisSettings,
  Axis,
  getXAxisDatetimeSettings,
  getCategoricalCompareValue,
  getDateFormatter,
} from './translations/axis-section';
import { StackableChartDesignOptions, PolarType } from './translations/design-options';
import {
  determineHighchartsChartType,
  addStackingIfSpecified,
  formatSeries,
  autoCalculateYAxisMinMax,
  indexMapWhenOnlyY,
  determineYAxisOptions,
  getColorSetting,
  formatSeriesContinuousXAxis,
} from './translations/translations-to-highcharts';
import { getTooltipSettings } from './translations/tooltip';
import merge from 'deepmerge';
import { chartOptionsDefaults } from './defaults/cartesian';
import { onlyY } from '../chart-data/utils';
import { ChartType, CompleteThemeSettings } from '../types';
import { CartesianChartDataOptionsInternal } from '../chart-data-options/types';
import { applyNumberFormatToPlotBands, getCategoriesIndexMapAndPlotBands } from './plot-bands';
import { HighchartsOptionsInternal } from './chart-options-service';
import { getNavigator } from './translations/navigator';
import { isDatetime } from '@sisense/sdk-data';
import { categoriesSliceWarning, seriesSliceWarning } from '../utils/data-limit-warning';
import { OptionsWithAlerts } from './../types';
import { getPaletteColor } from '../chart-data-options/coloring/utils';

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
export const getCartesianChartOptions = (
  chartData: ChartData,
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: CartesianChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
  dateFormatter?: (date: Date, format: string) => string,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];
  const continuousDatetimeXAxis =
    (dataOptions.x.length === 1 &&
      dataOptions.x[0].continuous &&
      isDatetime(dataOptions.x[0].type)) ||
    false;
  const globalDesignOptions = chartDesignOptions.globalDesign;
  const sisenseChartType = determineHighchartsChartType(chartType, globalDesignOptions);
  if (chartData.type !== 'cartesian') {
    throw new Error('Unexpected chart type');
  }

  const { seriesCapacity, categoriesCapacity } = globalDesignOptions.dataLimits;

  if (chartData.xValues.length > categoriesCapacity) {
    alerts.push(categoriesSliceWarning('x', chartData.xValues.length, categoriesCapacity));
  }

  // get categories and limit to max allowed
  // create plot band for each X2 value
  // create map of tic index to category value
  // index if X2 exist because plotBands adds
  // extra blank category (tic) between plot bands
  const { categories, indexMap, plotBands } = applyNumberFormatToPlotBands(
    dataOptions,
    getCategoriesIndexMapAndPlotBands(
      {
        ...chartData,
        xValues: chartData.xValues.slice(0, categoriesCapacity),
      },
      dataOptions,
      globalDesignOptions,
      continuousDatetimeXAxis,
    ),
  );

  const [yAxisSide, yAxisChartType, yTreatNullDataAsZeros, yConnectNulls] = determineYAxisOptions(
    chartData,
    dataOptions,
  );

  const xAxisOrientation =
    chartType === 'bar' || yAxisChartType.includes('bar') ? 'vertical' : 'horizontal';

  const xAxisSettings = continuousDatetimeXAxis
    ? getXAxisDatetimeSettings(
        globalDesignOptions.xAxis,
        dataOptions.x[0],
        chartData.xValues.map(getCategoricalCompareValue),
        dateFormatter,
      )
    : getXAxisSettings(
        globalDesignOptions.xAxis,
        globalDesignOptions.x2Axis,
        categories,
        plotBands,
        xAxisOrientation,
        dataOptions,
        chartType,
      );

  const yAxisMinMax = autoCalculateYAxisMinMax(
    chartType,
    chartData,
    globalDesignOptions,
    yAxisSide,
    yTreatNullDataAsZeros,
    0,
  );

  // only calculate y2 if a value has showOnRightAxis
  const y2AxisMinMax = yAxisSide.some((v) => v === 1)
    ? autoCalculateYAxisMinMax(
        chartType,
        chartData,
        globalDesignOptions,
        yAxisSide,
        yTreatNullDataAsZeros,
        1,
      )
    : undefined;

  const { stacking, showTotal } = addStackingIfSpecified(
    chartType,
    globalDesignOptions as StackableChartDesignOptions,
  );

  let polarType: PolarType | undefined = undefined;
  let yAxis: Axis | undefined = globalDesignOptions.yAxis;
  if ('polarType' in globalDesignOptions) {
    polarType = globalDesignOptions.polarType;

    // Polar charts on the Analytics tab do not allow a y-axis title to be
    // set. Clear this value if it happens to be set.
    //
    // NOTE: In the future, we may want to refactor the design options type
    // so it is impossible to set a title on the y-axis if the chartType is
    // "polar".
    yAxis = {
      ...globalDesignOptions.yAxis,
      titleEnabled: false,
      title: null,
    };
  }

  const [yAxisSettings, axisClipped] = getYAxisSettings(
    yAxis,
    globalDesignOptions.y2Axis,
    yAxisMinMax,
    y2AxisMinMax,
    showTotal,
    dataOptions,
  );

  // if vertical x2 axis increase right spacing
  const rightSpacing = chartData.xAxisCount > 1 && xAxisOrientation === 'vertical' ? 90 : 20;

  // change null data to 0 for area stacked charts
  const treatNullDataAsZeros = chartType === 'area' && stacking !== undefined;
  const isPolarChart = Boolean(polarType);

  if (chartData.series.length > seriesCapacity) {
    alerts.push(seriesSliceWarning(chartData.series.length, seriesCapacity));
  }

  const options = merge<HighchartsOptionsInternal>(
    chartOptionsDefaults(chartType, polarType, stacking),
    {
      title: { text: null },
      chart: {
        type: sisenseChartType,
        spacing: [20, rightSpacing, 20, 20],
        alignTicks: false,
        polar: isPolarChart,
      },
      xAxis: xAxisSettings,
      yAxis: yAxisSettings,
      // The series level animation disables all animations, the chart
      // level animation only disables initial or subsequent paints
      legend: getLegendSettings(globalDesignOptions.legend),
      series: chartData.series
        .slice(0, seriesCapacity)
        .map((v: CategoricalSeriesValues, index: number) => {
          const dataOption = dataOptions.breakBy.length
            ? dataOptions.y[0]
            : dataOptions.y.find(({ name }) => name === v.name);
          const seriesId = dataOption?.name;
          const seriesSpecificDesignOptions: SeriesDesignOptions | undefined = seriesId
            ? chartDesignOptions.designPerSeries[seriesId]
            : undefined;
          const seriesDesignOptions = seriesSpecificDesignOptions || globalDesignOptions;
          return {
            ...(continuousDatetimeXAxis
              ? formatSeriesContinuousXAxis(
                  v,
                  indexMap,
                  treatNullDataAsZeros || yTreatNullDataAsZeros[index],
                  xAxisSettings[0].tickInterval as number,
                  globalDesignOptions.dataLimits.categoriesCapacity,
                  getDateFormatter(dataOptions.x[0], dateFormatter),
                  yAxisSettings[index],
                  axisClipped[index],
                )
              : onlyY(dataOptions) && !stacking
              ? formatSeries(
                  v,
                  indexMapWhenOnlyY(categories, index),
                  treatNullDataAsZeros || yTreatNullDataAsZeros[index],
                )
              : formatSeries(v, indexMap, treatNullDataAsZeros || yTreatNullDataAsZeros[index])),
            showInNavigator: true,
            stickyTracking: false,
            boostThreshold: 0,
            turboThreshold: 0,
            color:
              getColorSetting(dataOptions, v.name) ??
              getPaletteColor(themeSettings?.palette?.variantColors, index),
            yAxis: yAxisSide[index],
            dataLabels: {
              formatter: createValueLabelFormatter(dataOption?.numberFormatConfig),
            },
            ...(yAxisChartType[index] && { type: yAxisChartType[index] }),
            connectNulls: yConnectNulls[index],
            marker: getMarkerSettings(seriesDesignOptions.marker),
            lineWidth: seriesDesignOptions.lineWidth,
          };
        }),
      plotOptions: {
        series: {
          dataLabels: isPolarChart
            ? getPolarValueLabelSettings(globalDesignOptions.valueLabel, polarType!)
            : getValueLabelSettings(
                xAxisOrientation,
                globalDesignOptions.valueLabel,
                stacking && chartType !== 'area',
              ),
          marker: getMarkerSettings(globalDesignOptions.marker),
          ...(stacking && { stacking: stacking }),
          // Force setup of "stacking" as undefined required for correct transition between classic and stacked modes
          // if it missing then classic would not correct render if previously it was stacked
          stacking: stacking || undefined,
          connectNulls: false,
        },
      },
      navigator: getNavigator(
        sisenseChartType,
        globalDesignOptions.autoZoom,
        chartData.xValues.length,
      ),
      tooltip: getTooltipSettings(undefined, dataOptions),
    },
  );

  return { options, alerts };
};
