import { LineChartProps } from '../props';
import { Chart } from './Chart';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * A React component displaying data as a series of points connected by a line. Used to show trends or changes over time.
 * See [Line Chart](https://docs.sisense.com/main/SisenseLinux/line-chart.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <LineChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Years],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
 *   onDataPointClick= {(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 * ###
 * <img src="media://line-chart-example-1.png" width="800px" />
 * @param props - Line chart properties
 * @returns Line Chart component
 */
export const LineChart = (props: LineChartProps) => {
  useTrackComponentInit('LineChart', props);

  return (
    <TrackingContextProvider>
      <Chart {...props} chartType="line" />
    </TrackingContextProvider>
  );
};
