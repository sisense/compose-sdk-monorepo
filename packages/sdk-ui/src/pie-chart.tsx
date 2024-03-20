import { PieChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component representing data in a circular graph with the data shown as slices of a whole,
 * with each slice representing a proportion of the total.
 * See [Pie Chart](https://docs.sisense.com/main/SisenseLinux/pie-chart.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <PieChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue)],
 *   }}
 *   filters={[filterFactory.greaterThan(DM.Commerce.Revenue, 1000)]}
 *   onDataPointClick= {(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 *
 * <img src="media://pie-chart-example-1.png" width="600px" />
 * @param props - Pie chart properties
 * @returns Pie Chart component
 * @group Charts
 */
export const PieChart = asSisenseComponent({
  componentName: 'PieChart',
  shouldSkipSisenseContextWaiting,
})((props: PieChartProps) => {
  return <Chart {...props} chartType="pie" />;
});
