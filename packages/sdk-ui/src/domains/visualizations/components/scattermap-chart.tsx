import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { ScattermapChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that allows to visualize geographical data as data points on a map.
 *
 * @example
 * Scatter map chart displaying cost and revenue rank from the Sample ECommerce data model. The cost is indicated by size of each point and the revenue rank is indicated by the point's size.
 *
 * ```tsx
 * import { ScattermapChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <ScattermapChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       geo: [DM.Country.Country],
 *       size: measureFactory.sum(DM.Commerce.Cost, 'Size by Cost'),
 *       colorBy: {
 *         column: measureFactory.rank(measureFactory.sum(DM.Commerce.Revenue, 'Color by Revenue Rank')),
 *         color: { type: 'range', steps: 7, minColor: '#cf9270', maxColor: '#3900b3' },
 *       },
 *       details: DM.Brand.Brand,
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://scattermap-chart-example-1.png" width="700px" />
 *
 * @param props - Scattermap chart properties
 * @returns Scattermap Chart component
 * @group Charts
 */
export const ScattermapChart = asSisenseComponent({
  componentName: 'ScattermapChart',
  shouldSkipSisenseContextWaiting,
})((props: ScattermapChartProps) => {
  return <Chart {...props} chartType="scattermap" />;
});
