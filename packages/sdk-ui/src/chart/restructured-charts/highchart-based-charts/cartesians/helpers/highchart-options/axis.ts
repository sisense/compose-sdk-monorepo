import {
  buildCategoriesMeta,
  buildXAxisSettings,
  isContinuousDatetimeXAxis,
  XAxisOrientation,
} from '@/chart-options-processor/cartesian/utils/axis/axis-builders';
import { AxisSettings } from '@/chart-options-processor/translations/axis-section';

import { BuildContext } from '../../../types';
import { CartesianChartTypes } from '../../types';

export const getCartesianXAxis = (
  ctx: BuildContext<CartesianChartTypes>,
  orientation: XAxisOrientation,
): AxisSettings[] => {
  const categoriesMeta = buildCategoriesMeta(
    ctx.chartData,
    ctx.dataOptions,
    ctx.designOptions,
    isContinuousDatetimeXAxis(ctx.dataOptions.x),
  );

  return buildXAxisSettings({
    designOptions: ctx.designOptions,
    dataOptions: ctx.dataOptions,
    chartData: ctx.chartData,
    categoriesMeta,
    orientation,
    isContinuous: isContinuousDatetimeXAxis(ctx.dataOptions.x),
    dateFormatter: ctx.extraConfig.dateFormatter,
  });
};
