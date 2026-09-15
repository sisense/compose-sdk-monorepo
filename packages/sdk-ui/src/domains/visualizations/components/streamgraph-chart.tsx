import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { StreamgraphChartProps } from '@/props';

import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that displays a streamgraph chart.
 *
 * A streamgraph is a type of stacked area chart where areas are displaced around
 * a central axis. It is particularly effective for displaying volume across
 * different categories or over time with a relative scale that emphasizes
 * overall patterns and trends.

 * @example
 * ```tsx
 * import { StreamgraphChart } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <StreamgraphChart
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         category: [DM.Commerce.Date.Quarters],
 *         value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *         breakBy: [DM.Commerce.Condition],
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://streamgraph-chart-example-1.png" width="700px" />
 *
 * Additional examples:
 *
 * Styled with a visible y-axis, thinned-out x-axis labels, and a legend:
 * ```tsx
 * import { StreamgraphChart } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <StreamgraphChart
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         category: [DM.Commerce.Date.Quarters],
 *         value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *         breakBy: [DM.Commerce.Condition],
 *       }}
 *       styleOptions={{
 *         yAxis: {
 *           enabled: true,
 *           labels: { enabled: true },
 *           gridLines: false,
 *         },
 *         xAxis: {
 *           intervalJumps: 4,
 *           isIntervalEnabled: true,
 *         },
 *         legend: { enabled: true },
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://streamgraph-chart-example-2.png" width="700px" />
 * @param props - Streamgraph chart properties
 * @returns Streamgraph Chart component
 * @group Charts
 */
export const StreamgraphChart = asSisenseComponent({
  componentName: 'StreamgraphChart',
  shouldSkipSisenseContextWaiting,
})((props: StreamgraphChartProps) => {
  return <Chart {...props} chartType="streamgraph" />;
});
