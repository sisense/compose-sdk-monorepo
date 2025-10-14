import { getCategoryTooltipSettings } from '@/chart-options-processor/tooltip';
import { TooltipSettings } from '@/chart-options-processor/translations/tooltip-utils';

import { BuildContext } from '../../../types';

export const getBasicCategoricalTooltip = (ctx: BuildContext<'pie'>): TooltipSettings => {
  return getCategoryTooltipSettings(ctx.designOptions.pieLabels?.showDecimals, ctx.dataOptions);
};
