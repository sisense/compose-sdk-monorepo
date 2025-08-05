import { BuildContext } from '../../../types';
import { CartesianChartTypes } from '../../types';
import { TooltipSettings } from '@/chart-options-processor/translations/tooltip-utils';
import { getCartesianTooltipSettings } from '@/chart-options-processor/translations/tooltip';

export const getBasicCartesianTooltip = (
  ctx: BuildContext<CartesianChartTypes>,
): TooltipSettings => {
  return getCartesianTooltipSettings(ctx.dataOptions, ctx.extraConfig.translate);
};
