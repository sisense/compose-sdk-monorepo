import { FunnelChartProps } from '../props';
import { Chart } from './Chart';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * Funnel Chart Component.
 * A Funnel chart represents data progressively decreasing in size or quantity through a conical shape.
 * More info on [Sisense Documentation page](https://docs.sisense.com/main/SisenseLinux/funnel-chart.htm).
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
export const FunnelChart = (props: FunnelChartProps) => {
  useTrackComponentInit('FunnelChart', props);

  return (
    <TrackingContextProvider>
      <Chart {...props} chartType="funnel" />
    </TrackingContextProvider>
  );
};
