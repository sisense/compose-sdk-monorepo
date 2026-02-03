import { TooltipSettings } from '@/domains/visualizations/core/chart-options-processor/translations/tooltip-utils.js';
import { getCartesianTooltipSettings } from '@/domains/visualizations/core/chart-options-processor/translations/tooltip.js';

import { BuildContext } from '../../../types.js';
import { CartesianChartTypes } from '../../types.js';

export const getBasicCartesianTooltip = (
  ctx: BuildContext<CartesianChartTypes>,
): TooltipSettings => {
  return getCartesianTooltipSettings(ctx.dataOptions, ctx.extraConfig.translate);
};
