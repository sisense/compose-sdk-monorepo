/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-params */
import { CategoricalSeriesValues, ChartData } from '../chart-data/types';
import { ChartDesignOptions } from './translations/types';
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
import {
  StackableChartDesignOptions,
  PolarType,
  CartesianChartDesignOptions,
} from './translations/design-options';
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
import { getNavigator, setInitialScrollerPosition } from './translations/navigator';
import { isDatetime } from '@sisense/sdk-data';
import { categoriesSliceWarning, seriesSliceWarning } from '../utils/data-limit-warning';
import { OptionsWithAlerts } from './../types';
import { getPaletteColor } from '../chart-data-options/coloring/utils';
import { TFunction } from '@sisense/sdk-common';
import { NavigatorOptions } from '@sisense/sisense-charts';
import { TranslatableError } from '@/translation/translatable-error';

const DEFAULT_CHART_SPACING = 20;

enum TotalLabelVerticalSpacing {
  Small = 10,
  Medium = 30,
  Large = 40,
}

enum TotalLabelHorizontalSpacing {
  Small = 15,
  Medium = 25,
  Large = 40,
}

/**
 * Get additional spacing around chart needed for the total labels based on the chart type and design options.
 *
 * @internal
 */
function getChartSpacingForTotalLabels(
  chartType: ChartType,
  chartDesignOptions: StackableChartDesignOptions,
) {
  let rightSpacing = 0;
  let topSpacing = 0;

  if (chartDesignOptions.showTotal && chartDesignOptions.stackType === 'stack100') {
    const rotation = Math.abs(chartDesignOptions.totalLabelRotation || 0) % 180;

    if (chartType === 'bar') {
      if (rotation < 20) {
        rightSpacing = TotalLabelHorizontalSpacing.Large;
      } else if (rotation < 70) {
        rightSpacing = TotalLabelHorizontalSpacing.Medium;
      } else if (rotation < 110) {
        rightSpacing = TotalLabelHorizontalSpacing.Small;
      } else if (rotation < 160) {
        rightSpacing = TotalLabelHorizontalSpacing.Medium;
      } else {
        rightSpacing = TotalLabelHorizontalSpacing.Large;
      }
    }

    if (chartType === 'column' || chartType === 'area') {
      if (rotation < 20) {
        topSpacing = TotalLabelVerticalSpacing.Small;
      } else if (rotation < 70) {
        topSpacing = TotalLabelVerticalSpacing.Medium;
      } else if (rotation < 110) {
        topSpacing = TotalLabelVerticalSpacing.Large;
      } else if (rotation < 160) {
        topSpacing = TotalLabelVerticalSpacing.Medium;
      } else {
        topSpacing = TotalLabelVerticalSpacing.Small;
      }
    }
  }

  return { rightSpacing, topSpacing };
}

/**
 * Get the shift for the total labels based on the chart type and design options.
 *
 * @internal
 */
function getTotalLabelsShift(
  chartType: ChartType,
  chartDesignOptions: StackableChartDesignOptions,
) {
  const { rightSpacing, topSpacing } = getChartSpacingForTotalLabels(chartType, chartDesignOptions);
  let rightShift = 0;
  let topShift = 0;
  if (topSpacing > 0) {
    topShift = -1 * (topSpacing / 2);
  }
  if (rightSpacing > 0) {
    rightShift = 0.1;
  }

  return {
    rightShift,
    topShift,
  };
}

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
  translate: TFunction,
  themeSettings?: CompleteThemeSettings,
  dateFormatter?: (date: Date, format: string) => string,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];
  const continuousDatetimeXAxis =
    (dataOptions.x.length === 1 &&
      dataOptions.x[0].continuous &&
      isDatetime(dataOptions.x[0].column.type)) ||
    false;
  const sisenseChartType = determineHighchartsChartType(chartType, chartDesignOptions);
  if (chartData.type !== 'cartesian') {
    throw new TranslatableError('errors.unexpectedChartType', { chartType: chartData.type });
  }

  const { seriesCapacity, categoriesCapacity } = chartDesignOptions.dataLimits;

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
      chartDesignOptions,
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
        chartDesignOptions.xAxis,
        dataOptions.x[0],
        chartData.xValues.map(getCategoricalCompareValue),
        dateFormatter,
      )
    : getXAxisSettings(
        chartDesignOptions.xAxis,
        chartDesignOptions.x2Axis,
        categories,
        plotBands,
        xAxisOrientation,
        dataOptions,
        chartType,
      );

  const yAxisMinMax = autoCalculateYAxisMinMax(
    chartType,
    chartData,
    chartDesignOptions,
    yAxisSide,
    yTreatNullDataAsZeros,
    0,
  );

  // only calculate y2 if a value has showOnRightAxis
  const y2AxisMinMax = yAxisSide.some((v) => v === 1)
    ? autoCalculateYAxisMinMax(
        chartType,
        chartData,
        chartDesignOptions,
        yAxisSide,
        yTreatNullDataAsZeros,
        1,
      )
    : undefined;

  const { stacking, showTotal } = addStackingIfSpecified(
    chartType,
    chartDesignOptions as StackableChartDesignOptions,
  );

  let polarType: PolarType | undefined = undefined;
  let yAxis: Axis | undefined = chartDesignOptions.yAxis;
  if ('polarType' in chartDesignOptions) {
    polarType = chartDesignOptions.polarType;

    // Polar charts on the Analytics tab do not allow a y-axis title to be
    // set. Clear this value if it happens to be set.
    //
    // NOTE: In the future, we may want to refactor the design options type
    // so it is impossible to set a title on the y-axis if the chartType is
    // "polar".
    yAxis = {
      ...chartDesignOptions.yAxis,
      titleEnabled: false,
      title: null,
    };
  }

  const [yAxisSettings, axisClipped] = getYAxisSettings(
    yAxis,
    chartDesignOptions.y2Axis,
    yAxisMinMax,
    y2AxisMinMax,
    showTotal,
    (chartDesignOptions as StackableChartDesignOptions).totalLabelRotation ?? 0,
    dataOptions,
    stacking,
    themeSettings,
  );

  // if vertical x2 axis increase right spacing
  const xAxisLabelRightSpacing =
    chartData.xAxisCount > 1 && xAxisOrientation === 'vertical' ? 70 : 0;
  const xAxisLabelTopSpacing =
    chartData.xAxisCount > 1 && xAxisOrientation === 'horizontal' ? 20 : 0;
  const { rightSpacing: totalLabelRightSpacing, topSpacing: totalLabelTopSpacing } =
    getChartSpacingForTotalLabels(chartType, chartDesignOptions as StackableChartDesignOptions);
  const { rightShift, topShift } = getTotalLabelsShift(
    chartType,
    chartDesignOptions as StackableChartDesignOptions,
  );
  yAxisSettings.forEach((axis) => {
    if (axis.stackLabels) {
      axis.stackLabels.x = rightShift;
      axis.stackLabels.y = topShift;
    }
  });
  xAxisSettings.forEach((axis) => {
    axis.plotBands?.forEach((plotBand) => {
      if (plotBand.label) {
        const ADDITIONAL_SPACING = 15;
        if (plotBand.label.x === undefined) plotBand.label.x = 0;
        plotBand.label.x += totalLabelRightSpacing
          ? totalLabelRightSpacing + ADDITIONAL_SPACING
          : 0;
        if (plotBand.label.y === undefined) plotBand.label.y = 0;
        plotBand.label.y -= totalLabelTopSpacing ? totalLabelTopSpacing + ADDITIONAL_SPACING : 0;
      }
    });
  });

  const totalTopSpacing = DEFAULT_CHART_SPACING + totalLabelTopSpacing + xAxisLabelTopSpacing;
  const totalRightSpacing = DEFAULT_CHART_SPACING + totalLabelRightSpacing + xAxisLabelRightSpacing;

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
        spacing: [totalTopSpacing, totalRightSpacing, DEFAULT_CHART_SPACING, DEFAULT_CHART_SPACING],
        alignTicks: false,
        polar: isPolarChart,
        events: {
          load: function () {
            if (dataOptions.x.length === 2) return;
            const chart = this as Highcharts.Chart;
            const chartWidth = chart.chartWidth;
            const chartHeight = chart.chartHeight;

            const navigator = getNavigator(
              sisenseChartType,
              chartDesignOptions.autoZoom.enabled,
              chartData.xValues.length,
              chartType === 'bar' ? chartHeight : chartWidth,
              chartType === 'bar',
            ) as NavigatorOptions;

            if (navigator.enabled && chartDesignOptions.autoZoom?.scrollerLocation) {
              const { min, max } = chartDesignOptions.autoZoom.scrollerLocation;
              setInitialScrollerPosition(chart, min, max);
            }

            chart.update({ navigator }, true);
          },
        },
      },
      xAxis: xAxisSettings,
      yAxis: yAxisSettings,
      // The series level animation disables all animations, the chart
      // level animation only disables initial or subsequent paints
      legend: getLegendSettings(chartDesignOptions.legend),
      series: chartData.series
        .slice(0, seriesCapacity)
        .map((v: CategoricalSeriesValues, index: number) => {
          const dataOption = dataOptions.breakBy.length
            ? dataOptions.y[0]
            : dataOptions.y.find(({ column: { name } }) => name === v.name);
          const seriesId = dataOption?.column.name;
          const cartesianChartDesignOptions = chartDesignOptions as CartesianChartDesignOptions;
          const seriesSpecificDesignOptions = seriesId
            ? cartesianChartDesignOptions.designPerSeries[seriesId]
            : undefined;
          const seriesDesignOptions = seriesSpecificDesignOptions || chartDesignOptions;
          return {
            ...(continuousDatetimeXAxis
              ? formatSeriesContinuousXAxis(
                  v,
                  indexMap,
                  treatNullDataAsZeros || yTreatNullDataAsZeros[index],
                  xAxisSettings[0].tickInterval as number,
                  chartDesignOptions.dataLimits.categoriesCapacity,
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
              formatter: createValueLabelFormatter(
                dataOption?.numberFormatConfig,
                chartDesignOptions.valueLabel,
              ),
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
            ? getPolarValueLabelSettings(chartDesignOptions.valueLabel, polarType!)
            : getValueLabelSettings(
                xAxisOrientation,
                chartDesignOptions.valueLabel,
                stacking && chartType !== 'area',
              ),
          marker: getMarkerSettings(chartDesignOptions.marker),
          ...(stacking && { stacking: stacking }),
          // Force setup of "stacking" as undefined required for correct transition between classic and stacked modes
          // if it missing then classic would not correct render if previously it was stacked
          stacking: stacking || undefined,
          connectNulls: false,
        },
      },
      tooltip: getTooltipSettings(undefined, dataOptions, translate),
    },
  );

  return { options, alerts };
};
