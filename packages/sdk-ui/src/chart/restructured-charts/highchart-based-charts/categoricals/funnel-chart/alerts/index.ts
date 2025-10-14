import { getAlerts } from '@/chart-options-processor/translations/funnel-series';

import { BuildContext } from '../../../types';

/**
 * Funnel-specific alerts function that extracts alerts from the funnel series formatting.
 */
export const getFunnelChartAlerts = (ctx: BuildContext<'funnel'>): string[] => {
  return getAlerts(ctx.chartData, ctx.designOptions);
};
