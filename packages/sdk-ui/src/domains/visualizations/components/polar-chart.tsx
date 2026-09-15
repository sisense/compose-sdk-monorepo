import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { PolarChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component comparing multiple categories/variables with a spatial perspective in a radial chart.
 *
 * @example
 * Polar chart displaying total revenue per age range from the Sample ECommerce data model.
 *
 * ```tsx
 * import { PolarChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <PolarChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [DM.Commerce.AgeRange],
 *       value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *       breakBy: [],
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://polar-chart-example-1.png" width="700px" />
 *
 * Area polar chart variant, using the same data:
 *
 * ```tsx
 * <PolarChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [],
 *   }}
 *   styleOptions={{ subtype: 'polar/area' }}
 * />
 * ```
 *
 * <img src="media://polar-chart-example-2.png" width="700px" />
 *
 * Line polar chart variant, using the same data:
 *
 * ```tsx
 * <PolarChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [],
 *   }}
 *   styleOptions={{ subtype: 'polar/line' }}
 * />
 * ```
 *
 * <img src="media://polar-chart-example-3.png" width="700px" />
 *
 * @param props - Polar chart properties
 * @returns Polar Chart component
 * @group Charts
 */
export const PolarChart = asSisenseComponent({
  componentName: 'PolarChart',
  shouldSkipSisenseContextWaiting,
})((props: PolarChartProps) => {
  return <Chart {...props} chartType="polar" />;
});
