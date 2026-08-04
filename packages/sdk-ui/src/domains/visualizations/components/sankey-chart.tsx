import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { SankeyChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that visualizes flow and volume between nodes using a Sankey diagram.
 * Node width represents the total flow through that node; link width represents the flow
 * between two connected nodes.
 *
 * ## Example
 *
 * ```tsx
 * <SankeyChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
 *     value: measureFactory.sum(DM.Commerce.Revenue),
 *   }}
 *   styleOptions={{
 *     orientation: 'horizontal',
 *     nodeAlignment: 'top',
 *   }}
 * />
 * ```
 *
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
