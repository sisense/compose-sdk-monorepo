import { getAlerts } from '@/domains/visualizations/core/chart-options-processor/translations/funnel-series.js';

import { BuildContext } from '../../../types.js';

/**
 * Funnel-specific alerts function that extracts alerts from the funnel series formatting.
 */
export const getFunnelChartAlerts = (ctx: BuildContext<'funnel'>): string[] => {
  return getAlerts(ctx.chartData, ctx.designOptions);
};
