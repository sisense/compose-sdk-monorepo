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
import { configureAxes } from './utils/axis-configuration';
import { processSeries } from './utils/series-processor';
import { applyLabelPositioning, determineChartState } from './utils/chart-configuration';

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

  // Configure axes using the extracted utility
  const axisConfig = configureAxes({
    chartData,
    chartType,
    chartDesignOptions,
    dataOptions,
    themeSettings,
    dateFormatter,
  });

  // Calculate spacing using the extracted utility
  const spacingConfig = calculateChartSpacing({
    chartType,
    chartData,
    chartDesignOptions,
    xAxisOrientation: axisConfig.xAxisOrientation,
  });

  // Determine chart state
  const chartState = determineChartState(chartType, chartDesignOptions, axisConfig.stacking);

  // Apply label positioning adjustments
  const stackableDesignOptions = chartDesignOptions as StackableChartDesignOptions;

  // Calculate spacing that should be applied specifically for total labels.
  const { rightSpacing: totalLabelRightSpacing, topSpacing: totalLabelTopSpacing } =
    stackableDesignOptions.showTotal && stackableDesignOptions.stackType === 'stack100'
      ? getChartSpacingForTotalLabels(chartType, stackableDesignOptions)
      : { rightSpacing: 0, topSpacing: 0 };

  applyLabelPositioning(
    axisConfig.xAxisSettings,
    axisConfig.yAxisSettings,
    spacingConfig.rightShift,
    spacingConfig.topShift,
    totalLabelRightSpacing,
    totalLabelTopSpacing,
  );

  // Process series data using the extracted utility
  const processedSeries = processSeries({
    chartData,
    chartType,
    chartDesignOptions,
    dataOptions,
    continuousDatetimeXAxis: axisConfig.continuousDatetimeXAxis,
    indexMap: axisConfig.indexMap,
    categories: axisConfig.categories,
    treatNullDataAsZeros: chartState.treatNullDataAsZeros,
    yTreatNullDataAsZeros: axisConfig.yTreatNullDataAsZeros,
    yConnectNulls: axisConfig.yConnectNulls,
    yAxisSide: axisConfig.yAxisSide,
    yAxisChartType: axisConfig.yAxisChartType,
    yAxisSettings: axisConfig.yAxisSettings,
    axisClipped: axisConfig.axisClipped,
    xAxisSettings: axisConfig.xAxisSettings,
    stacking: axisConfig.stacking,
    themeSettings,
    dateFormatter,
  });

  // Assemble the final chart configuration
  const options = merge<HighchartsOptionsInternal>(
    chartOptionsDefaults(chartType, chartState.polarType, axisConfig.stacking as Stacking),
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
      xAxis: axisConfig.xAxisSettings,
      yAxis: axisConfig.yAxisSettings,
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
                axisConfig.xAxisOrientation,
                chartDesignOptions.valueLabel,
                Boolean(axisConfig.stacking && chartType !== 'area'),
              ),
          marker: getMarkerSettings(chartDesignOptions.marker),
          ...(axisConfig.stacking && { stacking: axisConfig.stacking as any }),
          stacking: (axisConfig.stacking as Stacking) || undefined,
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
