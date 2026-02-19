import {
  buildCategoriesMeta,
  buildXAxisSettings,
  isContinuousDatetimeXAxis,
  XAxisOrientation,
} from '@/domains/visualizations/core/chart-options-processor/cartesian/utils/axis/axis-builders.js';
import { AxisSettings } from '@/domains/visualizations/core/chart-options-processor/translations/axis-section.js';

import { BuildContext } from '../../../types.js';
import { CartesianChartTypes } from '../../types.js';

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
