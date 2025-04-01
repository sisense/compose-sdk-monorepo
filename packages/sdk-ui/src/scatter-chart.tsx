import { ScatterChartProps } from './props';
import { Chart } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';
/**
 * A React component displaying the distribution of two variables on an X-Axis, Y-Axis,
 * and two additional fields of data that are shown as colored circles scattered across the chart.
 *
 * **Point**: A field that for each of its members a scatter point is drawn. The maximum amount of data points is 500.
 *
 * **Size**: An optional field represented by the size of the circles.
 * If omitted, all scatter points are equal in size. If used, the circle sizes are relative to their values.
 *
 * ## Example
 *
 * Scatter chart displaying total revenue per category, broken down by gender, from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fscatter-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional Scatter Chart examples:
 *
 * - [Bubble Scatter Chart](https://www.sisense.com/developers/playground/?example=charts/scatter-chart-bubble)
 *
 * @param props - Scatter chart properties
 * @returns Scatter Chart component
 * @group Charts
 */
export const ScatterChart = asSisenseComponent({
  componentName: 'ScatterChart',
  shouldSkipSisenseContextWaiting,
})((props: ScatterChartProps) => {
  return <Chart {...props} chartType="scatter" />;
});
