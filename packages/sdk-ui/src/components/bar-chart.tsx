import { BarChartProps } from '../props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/as-sisense-component';

/**
 * A React component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
 * See [Bar Chart](https://docs.sisense.com/main/SisenseLinux/bar-chart.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <BarChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
 *   onDataPointClick={(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 * ###
 * <img src="media://bar-chart-example-1.png" width="800"/>
 * @param props - Bar chart properties
 * @returns Bar Chart component
 */
export const BarChart = asSisenseComponent({
  componentName: 'BarChart',
  shouldSkipSisenseContextWaiting,
})((props: BarChartProps) => {
  return <Chart {...props} chartType="bar" />;
});
