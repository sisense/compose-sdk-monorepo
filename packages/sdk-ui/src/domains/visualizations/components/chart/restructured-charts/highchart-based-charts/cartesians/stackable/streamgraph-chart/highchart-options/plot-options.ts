import { HighchartsOptionsInternal } from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';

import { BuildContext } from '../../../../types.js';
import { getLegacyCartesianChartOptions } from '../../../helpers/highchart-options/get-legacy-cartesian-chart-options.js';

/**
 * Build plot options for streamgraph charts.
 *
 * Configures series-level defaults including:
 * - Series labels with adaptive sizing
 * - Accessibility settings
 * - Streamgraph-specific stacking
 */

/**
 * Build plot options for streamgraph charts.
 *
 * Configures series-level defaults including:
 * - Series labels with adaptive sizing
 * - Accessibility settings
 * - Streamgraph-specific stacking
 */
export const getPlotOptions = (
  ctx: BuildContext<'streamgraph'>,
): HighchartsOptionsInternal['plotOptions'] => {
  // temporary inherit plot options from area chart until it will be refactored and decomposed to reuse common parts
  const areaPlotOptions = getLegacyCartesianChartOptions(ctx, 'area').plotOptions!;

  const lineWidth = ctx.designOptions.line?.width ?? 1;

  return {
    ...areaPlotOptions,
    series: {
      ...areaPlotOptions.series,
      // Streamgraph uses 'stream' stacking mode (Highcharts specific)
      stacking: 'stream',
      // Line style (applies to area boundaries)
      lineWidth,
      fillOpacity: 1, // Full opacity for areas
      label: {
        enabled: ctx.designOptions.seriesTitles?.enabled ?? true,
        minFontSize: 5,
        maxFontSize: 15,
        style: ctx.designOptions.seriesTitles?.textStyle,
      },
    },
  };
};
