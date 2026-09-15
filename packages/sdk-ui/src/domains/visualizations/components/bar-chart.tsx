import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { BarChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
 *
 * @example
 * Bar chart displaying total revenue per year from the Sample ECommerce data model.
 *
 * ```tsx
 * import { BarChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <BarChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [DM.Commerce.Date.Years],
 *       value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *       breakBy: [DM.Commerce.Condition],
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://bar-chart-example-1.png" width="700px" />
 *
 * Stacked bar chart variant, broken down by age range:
 *
 * ```tsx
 * <BarChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Years],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.AgeRange],
 *   }}
 *   styleOptions={{ subtype: 'bar/stacked' }}
 * />
 * ```
 *
 * <img src="media://bar-chart-example-2.png" width="700px" />
 *
 * Stacked percentage bar chart variant, using the same data:
 *
 * ```tsx
 * <BarChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Years],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.AgeRange],
 *   }}
 *   styleOptions={{ subtype: 'bar/stacked100' }}
 * />
 * ```
 *
 * <img src="media://bar-chart-example-3.png" width="700px" />
 *
 * @param props - Bar chart properties
 * @returns Bar Chart component
 * @group Charts
 */
export const BarChart = asSisenseComponent({
  componentName: 'BarChart',
  shouldSkipSisenseContextWaiting,
})((props: BarChartProps) => {
  return <Chart {...props} chartType="bar" />;
});
