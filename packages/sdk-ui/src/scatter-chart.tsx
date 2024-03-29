import { ScatterChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component displaying the distribution of two variables on an X-Axis, Y-Axis,
 * and two additional fields of data that are shown as colored circles scattered across the chart.
 *
 * **Point**: A field that for each of its members a scatter point is drawn. The maximum amount of data points is 500.
 *
 * **Size**: An optional field represented by the size of the circles.
 * If omitted, all scatter points are equal in size. If used, the circle sizes are relative to their values.
 *
 * See [Scatter Chart](https://docs.sisense.com/main/SisenseLinux/scatter-chart.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source.
 *
 * The chart shows top Categories by Total Revenue on the x-axis, and Total Quantity on the y-axis in logarithmic scale
 * with Gender breakdown by color and Total Cost encoded by the size of the bubbles.
 * ```tsx
 * <ScatterChart
 *   dataSet={DM.DataSource}
 *   filters={[filterFactory.greaterThan(DM.Commerce.Revenue, 10)]}
 *   dataOptions={{
 *     x: measureFactory.sum(DM.Commerce.Revenue),
 *     y: measureFactory.sum(DM.Commerce.Quantity),
 *     breakByPoint: DM.Category.Category,
 *     breakByColor: DM.Commerce.Gender,
 *     size: measureFactory.sum(DM.Commerce.Cost),
 *   }}
 *   styleOptions={{
 *     xAxis: {
 *       enabled: true,
 *       gridLines: true,
 *       isIntervalEnabled: false,
 *       labels: {
 *         enabled: true,
 *       },
 *       logarithmic: true,
 *       title: {
 *         enabled: true,
 *         text: 'Total Revenue',
 *       },
 *     },
 *     yAxis: {
 *       enabled: true,
 *       gridLines: true,
 *       isIntervalEnabled: false,
 *       labels: {
 *         enabled: true,
 *       },
 *       logarithmic: true,
 *       title: {
 *         enabled: true,
 *         text: 'Total Quantity',
 *       },
 *     },
 *   }}
 *   onDataPointClick={(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 *
 * <img src="media://scatter-chart-example-1.png" width="800px" />
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
