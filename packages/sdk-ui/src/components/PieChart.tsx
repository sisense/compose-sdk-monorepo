import { PieChartProps } from '../props';
import { Chart } from './Chart';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * Pie Chart Component.
 * A pie chart is a circular graph that represents data as slices of a whole,
 * with each slice representing a proportion of the total.
 * More info on [Sisense Documentation page](https://docs.sisense.com/main/SisenseLinux/pie-chart.htm).
 *
 * @example
 * Example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <PieChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *   }}
 *   filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
 *   onDataPointClick= {(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 * ###
 * <img src="media://pie-chart-example-1.png" width="600px" />
 * @param props - Pie chart properties
 * @returns Pie Chart component
 */
export const PieChart = (props: PieChartProps) => {
  useTrackComponentInit('PieChart', props);

  return (
    <TrackingContextProvider>
      <Chart {...props} chartType="pie" />
    </TrackingContextProvider>
  );
};
