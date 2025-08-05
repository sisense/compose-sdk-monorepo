import { LegendSettings } from '@/chart-options-processor/translations/legend-section';
import { BuildContext } from '../../../../types';
import { getBasicCartesianLegend } from '../../../helpers/highchart-options/legend';

export const getLegend = (ctx: BuildContext<'bar'>): LegendSettings => {
  return withRightMargin(ctx)(getBasicCartesianLegend(ctx.designOptions.legend));
};

/**
 * Add right margin to legend if the chart has multiple x-axis values and the legend is on the right.
 * Needed to avoid overlapping of legend with the chart.
 */
function withRightMargin(ctx: BuildContext<'bar'>): (legend: LegendSettings) => LegendSettings {
  const LEGEND_RIGHT_MARGIN = 80;

  return (legend: LegendSettings) => {
    if (ctx.dataOptions.x.length > 1 && ctx.designOptions.legend === 'right') {
      return { ...legend, margin: LEGEND_RIGHT_MARGIN };
    }
    return legend;
  };
}
