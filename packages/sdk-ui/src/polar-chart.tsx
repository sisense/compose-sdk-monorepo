import { PolarChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component comparing multiple categories/variables with a spacial perspective in a radial chart.
 *
 * ## Example
 *
 * Polar chart displaying total revenue per age range from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fpolar-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional Polar Chart examples:
 *
 * - [Area Polar Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts%2Fpolar-chart-area)
 * - [Line Polar Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts%2Fpolar-chart-line)
 *
 * @param props - Polar chart properties
 * @returns Polar Chart component
 * @group Charts
 */
export const PolarChart = asSisenseComponent({
  componentName: 'PolarChart',
  shouldSkipSisenseContextWaiting,
})((props: PolarChartProps) => {
  return <Chart {...props} chartType="polar" />;
});
