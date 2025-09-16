import { BuildContext } from '../../../types';
import { TooltipSettings } from '@/chart-options-processor/translations/tooltip-utils';
import { getCategoryTooltipSettings } from '@/chart-options-processor/tooltip';

export const getBasicCategoricalTooltip = (ctx: BuildContext<'pie'>): TooltipSettings => {
  return getCategoryTooltipSettings(ctx.designOptions.pieLabels?.showDecimals, ctx.dataOptions);
};
