import { getCategoryTooltipSettings } from '@/domains/visualizations/core/chart-options-processor/tooltip.js';
import { TooltipSettings } from '@/domains/visualizations/core/chart-options-processor/translations/tooltip-utils.js';

import { BuildContext } from '../../../types.js';

export const getBasicCategoricalTooltip = (ctx: BuildContext<'pie'>): TooltipSettings => {
  return getCategoryTooltipSettings(
    ctx.designOptions.seriesLabels?.percentageLabels?.showDecimals,
    ctx.dataOptions,
  );
};
