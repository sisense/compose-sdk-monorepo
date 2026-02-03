import flow from 'lodash-es/flow';

import { SisenseChartDataPointsEventHandler } from '@/domains/visualizations/components/chart/components/sisense-chart/types.js';
import { SisenseChartDataPointEventHandler } from '@/domains/visualizations/components/chart/components/sisense-chart/types.js';
import { withEventHandlers } from '@/domains/visualizations/core/chart-options-processor/apply-event-handlers.js';
import { HighchartsOptionsInternal } from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';
import { withCommonHighchartsOptions } from '@/domains/visualizations/core/chart-options-processor/common-highcharts-option-service.js';
import { withThemeOptions } from '@/domains/visualizations/core/chart-options-processor/theme-option-service.js';
import { BeforeRenderHandler } from '@/props';

import { TypedDataOptionsInternal, TypedDesignOptions } from '../../types.js';
import { TypedChartData } from '../../types.js';
import { BuildContext, HighchartBasedChartTypes, HighchartsOptionsBuilder } from '../types.js';

export const buildHighchartsOptions = <CT extends HighchartBasedChartTypes>({
  highchartsOptionsBuilder: builder,
  chartData,
  dataOptions,
  designOptions,
  extraConfig,
  dataPointsEventHandlers,
  onBeforeRender,
}: {
  highchartsOptionsBuilder: HighchartsOptionsBuilder<CT>;
  chartData: TypedChartData<CT>;
  dataOptions: TypedDataOptionsInternal<CT>;
  designOptions: TypedDesignOptions<CT>;
  dataPointsEventHandlers: {
    onDataPointClick?: SisenseChartDataPointEventHandler;
    onDataPointContextMenu?: SisenseChartDataPointEventHandler;
    onDataPointsSelected?: SisenseChartDataPointsEventHandler;
  };
  extraConfig: BuildContext<CT>['extraConfig'];
  onBeforeRender?: BeforeRenderHandler;
}): HighchartsOptionsInternal => {
  const builderContext: BuildContext<CT> = {
    chartData,
    dataOptions,
    designOptions,
    extraConfig,
  };

  return flow(
    withCommonHighchartsOptions(extraConfig.themeSettings, extraConfig.accessibilityEnabled),
    withEventHandlers(dataOptions, dataPointsEventHandlers),
    withThemeOptions(extraConfig.themeSettings),
    withUserCustomizations(onBeforeRender),
  )({
    chart: builder.getChart(builderContext),
    series: builder.getSeries(builderContext),
    ...builder.getAxes(builderContext),
    legend: builder.getLegend(builderContext),
    plotOptions: builder.getPlotOptions(builderContext),
    tooltip: builder.getTooltip(builderContext),
    ...builder.getExtras(builderContext),
  });
};

/**
 * Returns a function that applies user customizations to the chart options.
 * Configurable with user's `onBeforeRender` function.
 *
 * @param onBeforeRender - The user customizations function.
 * @returns A function that applies user customizations to the chart options.
 */
function withUserCustomizations(
  onBeforeRender?: BeforeRenderHandler,
): (chartOptions: HighchartsOptionsInternal) => HighchartsOptionsInternal {
  return (
    (onBeforeRender as (chartOptions: HighchartsOptionsInternal) => HighchartsOptionsInternal) ||
    ((chartOptions) => chartOptions) // Default to no-op if no customizations are provided
  );
}
