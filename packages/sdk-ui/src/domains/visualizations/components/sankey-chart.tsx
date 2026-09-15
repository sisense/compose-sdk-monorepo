import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { SankeyChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that visualizes flow and volume between nodes using a Sankey diagram.
 * Node width represents the total flow through that node; link width represents the flow
 * between two connected nodes.
 *
 * @example
 * ```tsx
 * import { SankeyChart } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <SankeyChart
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
 *         value: measureFactory.sum(DM.Commerce.Revenue),
 *       }}
 *       styleOptions={{
 *         orientation: 'horizontal',
 *         nodeAlignment: 'top',
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://sankey-chart-example-1.png" width="700px" />
 * @param props - Sankey chart properties
 * @returns Sankey Chart component
 * @group Charts
 */
export const SankeyChart = asSisenseComponent({
  componentName: 'SankeyChart',
  shouldSkipSisenseContextWaiting,
})((props: SankeyChartProps) => {
  return <Chart {...props} chartType="sankey" />;
});
