import { BuildContext } from '../../../types';
import { getAlerts } from '@/chart-options-processor/translations/funnel-series';

/**
 * Funnel-specific alerts function that extracts alerts from the funnel series formatting.
 */
export const getFunnelChartAlerts = (ctx: BuildContext<'funnel'>): string[] => {
  return getAlerts(ctx.chartData, ctx.designOptions);
};
