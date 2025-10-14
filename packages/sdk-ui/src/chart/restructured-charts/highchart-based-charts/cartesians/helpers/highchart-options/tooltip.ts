import { getCartesianTooltipSettings } from '@/chart-options-processor/translations/tooltip';
import { TooltipSettings } from '@/chart-options-processor/translations/tooltip-utils';

import { BuildContext } from '../../../types';
import { CartesianChartTypes } from '../../types';

export const getBasicCartesianTooltip = (
  ctx: BuildContext<CartesianChartTypes>,
): TooltipSettings => {
  return getCartesianTooltipSettings(ctx.dataOptions, ctx.extraConfig.translate);
};
