import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { AreaChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component similar to a {@link @sisense/sdk-ui!LineChart | `LineChart`},
 * but with filled in areas under each line and an option to display them as stacked.
 *
 * @example
 * Area chart displaying total revenue per quarter from the Sample ECommerce data model.
 *
 * ```tsx
 * import { AreaChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <AreaChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [DM.Commerce.Date.Quarters],
 *       value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *       breakBy: [],
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://area-chart-example-1.png" width="700px" />
 *
 * Stacked area chart variant, broken down by condition:
 *
 * ```tsx
 * <AreaChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   }}
 *   styleOptions={{ subtype: 'area/stacked' }}
 * />
 * ```
 *
 * <img src="media://area-chart-example-2.png" width="700px" />
 *
 * Stacked percentage area chart variant, using the same data:
 *
 * ```tsx
 * <AreaChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   }}
 *   styleOptions={{ subtype: 'area/stacked100' }}
 * />
 * ```
 *
 * <img src="media://area-chart-example-3.png" width="700px" />
 *
 * @param props - Area chart properties
 * @returns Area Chart component
 * @group Charts
 */
export const AreaChart = asSisenseComponent({
  componentName: 'AreaChart',
  shouldSkipSisenseContextWaiting,
})((props: AreaChartProps) => {
  return <Chart {...props} chartType="area" />;
});
