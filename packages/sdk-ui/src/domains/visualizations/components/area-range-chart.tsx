import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { AreaRangeChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that displays a range of data over a given time period or across multiple categories.
 * It is particularly useful for visualizing the minimum and maximum values in a dataset, along with the area between these values.
 *
 * @example
 * Area range chart displaying total revenue per quarter from the Sample ECommerce data model,
 * with the range spanning 60%-140% of the actual revenue.
 *
 * ```tsx
 * import { AreaRangeChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <AreaRangeChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [DM.Commerce.Date.Quarters],
 *       value: [
 *         {
 *           title: 'Revenue',
 *           upperBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 1.4, 'Upper Revenue'),
 *           lowerBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 0.6, 'Lower Revenue'),
 *         },
 *       ],
 *       breakBy: [],
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://area-range-chart-example-1.png" width="700px" />
 *
 * The same range broken down by condition:
 *
 * ```tsx
 * <AreaRangeChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [
 *       {
 *         title: 'Revenue',
 *         upperBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 1.4, 'Upper Revenue'),
 *         lowerBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 0.6, 'Lower Revenue'),
 *       },
 *     ],
 *     breakBy: [DM.Commerce.Condition],
 *   }}
 * />
 * ```
 *
 * <img src="media://area-range-chart-example-2.png" width="700px" />
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
