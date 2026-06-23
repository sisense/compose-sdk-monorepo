import { BuildContext } from '../../types';
import { SANKEY_LINKS_LIMIT } from '../data/index';

/** Beyond this many stages, labels and links usually become unreadable without stronger filtering. */
const SANKEY_STAGE_SOFT_LIMIT = 6;

/**
 * Returns alert messages for Sankey charts.
 */
export function getSankeyChartAlerts(ctx: BuildContext<'sankey'>): string[] {
  const { translate } = ctx.extraConfig;
  const alerts: string[] = [];
  const stageCount = ctx.dataOptions.category.length;

  if (stageCount > SANKEY_STAGE_SOFT_LIMIT) {
    alerts.push(
      translate('chart.sankey.alerts.tooManyStages', {
        stageCount: String(stageCount),
        softLimit: String(SANKEY_STAGE_SOFT_LIMIT),
      }),
    );
  }

  if (ctx.chartData.totalLinksBeforeTruncation !== undefined) {
    console.warn(
      `Sankey chart: query returned ${ctx.chartData.totalLinksBeforeTruncation} links; only the first ${SANKEY_LINKS_LIMIT} are displayed.`,
    );
  }

  return alerts;
}
