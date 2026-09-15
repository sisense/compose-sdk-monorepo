import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { PieChartProps } from '@/props';

import { Chart } from '../chart';
import { shouldSkipSisenseContextWaiting } from '../chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component representing data in a circular graph with the data shown as slices of a whole,
 * with each slice representing a proportion of the total.
 *
 * @example
 * Pie chart displaying total revenue per age range from the Sample ECommerce data model.
 *
 * ```tsx
 * import { PieChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <PieChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [DM.Commerce.AgeRange],
 *       value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     }}
 *     styleOptions={{ subtype: 'pie/classic' }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://pie-chart-example-1.png" width="700px" />
 *
 * Donut chart variant, using the same data:
 *
 * ```tsx
 * <PieChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   }}
 *   styleOptions={{ subtype: 'pie/donut' }}
 * />
 * ```
 *
 * <img src="media://pie-chart-example-2.png" width="700px" />
 *
 * Ring chart variant, using the same data:
 *
 * ```tsx
 * <PieChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   }}
 *   styleOptions={{ subtype: 'pie/ring' }}
 * />
 * ```
 *
 * <img src="media://pie-chart-example-3.png" width="700px" />
 *
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
