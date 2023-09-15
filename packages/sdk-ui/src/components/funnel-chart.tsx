import { FunnelChartProps } from '../props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/as-sisense-component';

/**
 * A React component representing data progressively decreasing in size or quantity through a conical shape.
 * See [Funnel Chart](https://docs.sisense.com/main/SisenseLinux/funnel-chart.htm) for more information.
 *
 * @example
 * An example of visualizing sales funnel data:
 * ```tsx
 * <FunnelChart
 *   dataSet={{
 *     columns: [
 *       { name: 'Stage', type: 'string' },
 *       { name: 'Unique Users', type: 'number' },
 *     ],
 *     rows: [
 *       ['Website visits', 15654],
 *       ['Downloads', 4064],
 *       ['Requested price list', 1987],
 *       ['Invoice sent', 976],
 *       ['Finalized', 846],
 *     ],
 *   }}
 *   dataOptions={{
 *     category: [
 *       {
 *         name: 'Stage',
 *         type: 'string',
 *       },
 *     ],
 *     value: [
 *       {
 *         name: 'Unique Users',
 *         aggregation: 'sum',
 *       },
 *     ],
 *   }}
 * />
 * ```
 * ###
 * <img src="media://funnel-chart-example-1.png" width="800"/>
 *
 * Note that the chart sorts the measure, `Unique Users`, in descending order by default.
 * @param props - Funnel chart properties
 * @returns Funnel Chart component
 */
export const FunnelChart = asSisenseComponent({
  componentName: 'FunnelChart',
  shouldSkipSisenseContextWaiting,
})((props: FunnelChartProps) => {
  return <Chart {...props} chartType="funnel" />;
});
