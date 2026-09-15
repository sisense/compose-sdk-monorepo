import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { ColumnChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
 *
 * The chart can include multiple values on both the X and Y-axis, as well as a break down by categories displayed on the Y-axis.
 *
 * @example
 * Column chart displaying total revenue per year, broken down by condition, from the Sample ECommerce data model.
 *
 * ```tsx
 * import { ColumnChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <ColumnChart
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
 * <img src="media://column-chart-example-1.png" width="700px" />
 *
 * Stacked column chart variant, broken down by age range:
 *
 * ```tsx
 * <ColumnChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Years],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.AgeRange],
 *   }}
 *   styleOptions={{ subtype: 'column/stackedcolumn' }}
 * />
 * ```
 *
 * <img src="media://column-chart-example-2.png" width="700px" />
 *
 * Stacked percentage column chart variant, using the same data:
 *
 * ```tsx
 * <ColumnChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Years],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.AgeRange],
 *   }}
 *   styleOptions={{ subtype: 'column/stackedcolumn100' }}
 * />
 * ```
 *
 * <img src="media://column-chart-example-3.png" width="700px" />
 *
 * @param props - Column chart properties
 * @returns Column Chart component
 * @group Charts
 */
export const ColumnChart = asSisenseComponent({
  componentName: 'ColumnChart',
  shouldSkipSisenseContextWaiting,
})((props: ColumnChartProps) => {
  return <Chart {...props} chartType="column" />;
});
