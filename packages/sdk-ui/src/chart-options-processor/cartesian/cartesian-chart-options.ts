/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { ChartData } from '../../chart-data/types';
import { ChartDesignOptions } from '../translations/types';
import { getLegendSettings } from '../translations/legend-section';
import {
  getPolarValueLabelSettings,
  getValueLabelSettings,
} from '../translations/value-label-section';
import { getMarkerSettings } from '../translations/marker-section';
import {
  StackableChartDesignOptions,
  LineChartDesignOptions,
} from '../translations/design-options';
import { determineHighchartsChartType } from '../translations/translations-to-highcharts';
import { getCartesianTooltipSettings } from '../translations/tooltip';
import merge from 'deepmerge';
import flow from 'lodash-es/flow';
import { chartOptionsDefaults } from '../defaults/cartesian';
import { ChartType, CompleteThemeSettings } from '../../types';
import { CartesianChartDataOptionsInternal } from '../../chart-data-options/types';
import { HighchartsOptionsInternal, Stacking } from '../chart-options-service';
import { getNavigator, setInitialScrollerPosition } from '../translations/navigator';
import { categoriesSliceWarning, seriesSliceWarning } from '../../utils/data-limit-warning';
import { OptionsWithAlerts } from '../../types';
import { TFunction } from '@sisense/sdk-common';
import { NavigatorOptions } from '@sisense/sisense-charts';
import { TranslatableError } from '@/translation/translatable-error';

// Import our new utilities
import {
  calculateChartSpacing,
  getAdditionalLegendSettings,
  getChartSpacingForTotalLabels,
} from './utils/chart-spacing-calculator';
import {
  isContinuousDatetimeXAxis,
  buildYAxisMeta,
  getXAxisOrientation,
  buildCategoriesMeta,
  buildXAxisSettings,
  buildYAxisMinMax,
  buildStackingMeta,
  buildYAxisSettings,
  hasSecondaryYAxis,
  type YAxisMeta,
  type CategoriesMeta,
  type StackingMeta,
  type XAxisOrientation,
  withChartSpecificAxisSettings,
} from './utils/axis/axis-builders';
import { processSeries } from './utils/series-processor';
import {
  withXAxisLabelPositioning,
  withYAxisLabelPositioning,
  determineChartState,
} from './utils/chart-configuration';

const DEFAULT_CHART_SPACING = 20;

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

  // Validate chart data type
  if (chartData.type !== 'cartesian') {
    throw new TranslatableError('errors.unexpectedChartType', { chartType: chartData.type });
  }

  const sisenseChartType = determineHighchartsChartType(chartType, chartDesignOptions);
  const { seriesCapacity, categoriesCapacity } = chartDesignOptions.dataLimits;

  // Check data limits and add alerts
  if (chartData.xValues.length > categoriesCapacity) {
    alerts.push(categoriesSliceWarning('x', chartData.xValues.length, categoriesCapacity));
  }
  if (chartData.series.length > seriesCapacity) {
    alerts.push(seriesSliceWarning(chartData.series.length, seriesCapacity));
  }

  // Configure axes using functional builders
  const continuousDatetimeXAxis = isContinuousDatetimeXAxis(dataOptions.x);
  const yAxisMeta: YAxisMeta = buildYAxisMeta(chartData, dataOptions);
  const xAxisOrientation: XAxisOrientation = getXAxisOrientation(chartType, yAxisMeta.chartType);

  const categoriesMeta: CategoriesMeta = buildCategoriesMeta(
    chartData,
    dataOptions,
    chartDesignOptions,
    continuousDatetimeXAxis,
  );

  const xAxisSettings = buildXAxisSettings({
    designOptions: chartDesignOptions,
    dataOptions,
    chartData,
    categoriesMeta,
    orientation: xAxisOrientation,
    isContinuous: continuousDatetimeXAxis,
    dateFormatter,
  });

  // Calculate Y-axis min/max for primary axis
  const primaryMinMax = buildYAxisMinMax(
    0,
    chartType,
    chartData,
    chartDesignOptions,
    yAxisMeta.side,
    yAxisMeta.treatNullAsZero,
  );

  // Calculate Y-axis min/max for secondary axis if needed
  const secondaryMinMax = hasSecondaryYAxis(yAxisMeta.side)
    ? buildYAxisMinMax(
        1,
        chartType,
        chartData,
        chartDesignOptions,
        yAxisMeta.side,
        yAxisMeta.treatNullAsZero,
      )
    : undefined;

  const stackingMeta: StackingMeta = buildStackingMeta(
    chartType,
    chartDesignOptions as StackableChartDesignOptions,
  );

  // specific to stackable charts
  const totalLabelRotation =
    (chartDesignOptions as StackableChartDesignOptions).totalLabelRotation ?? 0;

  const yAxisResult = buildYAxisSettings(
    chartDesignOptions.yAxis,
    chartDesignOptions.y2Axis,
    primaryMinMax,
    secondaryMinMax,
    stackingMeta,
    totalLabelRotation,
    dataOptions,
    themeSettings,
  );

  // Calculate spacing using the extracted utility
  const spacingConfig = calculateChartSpacing({
    chartType,
    chartData,
    chartDesignOptions: chartDesignOptions,
    xAxisOrientation,
  });

  // Determine chart state
  const chartState = determineChartState(chartType, chartDesignOptions, stackingMeta.stacking);

  // Apply label positioning adjustments
  const stackableDesignOptions = chartDesignOptions as StackableChartDesignOptions;

  // Calculate spacing that should be applied specifically for total labels.
  const { rightSpacing: totalLabelRightSpacing, topSpacing: totalLabelTopSpacing } =
    stackableDesignOptions.showTotal && stackableDesignOptions.stackType === 'stack100'
      ? getChartSpacingForTotalLabels(chartType, stackableDesignOptions)
      : { rightSpacing: 0, topSpacing: 0 };

  const updatedXAxisSettings = flow(
    withChartSpecificAxisSettings(chartType),
    withXAxisLabelPositioning({
      totalLabelRightSpacing,
      totalLabelTopSpacing,
    }),
  )(xAxisSettings);

  const updatedYAxisSettings = withYAxisLabelPositioning({
    rightShift: spacingConfig.rightShift,
    topShift: spacingConfig.topShift,
  })(yAxisResult.settings);

  // Process series data using the extracted utility
  const processedSeries = processSeries({
    chartData,
    chartType,
    chartDesignOptions: chartDesignOptions,
    dataOptions,
    continuousDatetimeXAxis,
    indexMap: categoriesMeta.indexMap,
    categories: categoriesMeta.categories,
    treatNullDataAsZeros: chartState.treatNullDataAsZeros,
    yTreatNullDataAsZeros: yAxisMeta.treatNullAsZero,
    yConnectNulls: yAxisMeta.connectNulls,
    yAxisSide: yAxisMeta.side,
    yAxisChartType: yAxisMeta.chartType,
    yAxisSettings: updatedYAxisSettings,
    axisClipped: yAxisResult.clipped,
    xAxisSettings: updatedXAxisSettings,
    stacking: stackingMeta.stacking,
    themeSettings,
    dateFormatter,
  });

  // Assemble the final chart configuration
  const options = merge<HighchartsOptionsInternal>(
    chartOptionsDefaults(chartType, chartState.polarType, stackingMeta.stacking as Stacking),
    {
      title: { text: null },
      chart: {
        type: sisenseChartType,
        spacing: [
          spacingConfig.totalTopSpacing,
          spacingConfig.totalRightSpacing,
          DEFAULT_CHART_SPACING,
          DEFAULT_CHART_SPACING,
        ],
        alignTicks: false,
        polar: chartState.isPolarChart,
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
      xAxis: updatedXAxisSettings,
      yAxis: updatedYAxisSettings,
      legend: {
        ...getLegendSettings(chartDesignOptions.legend),
        ...getAdditionalLegendSettings(chartType, dataOptions, chartDesignOptions),
      },
      series: processedSeries,
      plotOptions: {
        series: {
          dataLabels: chartState.isPolarChart
            ? getPolarValueLabelSettings(chartDesignOptions.valueLabel, chartState.polarType!)
            : getValueLabelSettings(
                xAxisOrientation,
                chartDesignOptions.valueLabel,
                Boolean(stackingMeta.stacking && chartType !== 'area'),
              ),
          marker: getMarkerSettings(chartDesignOptions.marker),
          stacking: (stackingMeta.stacking as Stacking) || undefined,
          connectNulls: false,
          ...(chartType === 'line' &&
            (chartDesignOptions as LineChartDesignOptions).step && {
              step: (chartDesignOptions as LineChartDesignOptions).step,
            }),
        },
      },
      tooltip: getCartesianTooltipSettings(dataOptions, translate),
    },
  );

  return { options, alerts };
};
