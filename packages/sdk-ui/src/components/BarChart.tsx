import { BarChartProps } from '../props';
import { Chart } from './Chart';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * Bar Chart Component.
 * A Bar Chart represents categorical data with horizontal rectangular bars
 * with lengths proportional to the values that they represent.
 * More info on [Sisense Documentation page](https://docs.sisense.com/main/SisenseLinux/bar-chart.htm).
 *
 * @example
 * Example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <BarChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
 *   onDataPointClick={(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 * ###
 * <img src="media://bar-chart-example-1.png" width="800"/>
 * @param props - Bar chart properties
 * @returns Bar Chart component
 */
export const BarChart = (props: BarChartProps) => {
  useTrackComponentInit('BarChart', props);

  return (
    <TrackingContextProvider>
      <Chart {...props} chartType="bar" />
    </TrackingContextProvider>
  );
};
