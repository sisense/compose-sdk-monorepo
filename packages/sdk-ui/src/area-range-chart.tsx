import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
import { AreaRangeChartProps } from './props';

/**
 * A React component that displays a range of data over a given time period or across multiple categories.
 * It is particularly useful for visualizing the minimum and maximum values in a dataset, along with the area between these values.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 *     <AreaRangeChart
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         category: [DM.Commerce.Date.Months],
 *         value: [
 *           {
 *             title: 'Revenue',
 *             upperBound: measureFactory.multiply(
 *               measureFactory.sum(DM.Commerce.Revenue, 'Lower Revenue'),
 *               0.6,
 *             ),
 *             lowerBound: measureFactory.multiply(
 *               measureFactory.sum(DM.Commerce.Revenue, 'Upper Revenue'),
 *               1.4,
 *             ),
 *           },
 *           {
 *             title: 'Cost',
 *             upperBound: measureFactory.multiply(
 *               measureFactory.sum(DM.Commerce.Cost, 'Lower Cost'),
 *               0.9,
 *             ),
 *             lowerBound: measureFactory.multiply(
 *               measureFactory.sum(DM.Commerce.Cost, 'Upper Cost'),
 *               2.4,
 *             ),
 *           },
 *         ],
 *         breakBy: [],
 *       }}
 *       styleOptions={{
 *         legend: {
 *           enabled: true,
 *           position: 'top',
 *         },
 *         lineWidth: {
 *           width: 'thick',
 *         },
 *         yAxis: {
 *           title: {
 *             enabled: true,
 *             text: 'ray style options',
 *           },
 *           enabled: true,
 *           gridLines: true,
 *           logarithmic: false,
 *         },
 *       }}
 *     />
 * ```
 *
 * <img src="media://area-range-chart-example-1.png" width="800"/>
 * @param props - Area Range chart properties
 * @returns Area Range Chart component
 * @group Charts
 */
export const AreaRangeChart = asSisenseComponent({
  componentName: 'AreaRangeChart',
  shouldSkipSisenseContextWaiting,
})((props: AreaRangeChartProps) => {
  return <Chart {...props} chartType="arearange" />;
});
