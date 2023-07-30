import { ColumnChartProps } from '../props';
import { Chart } from './Chart';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * Column Chart Component.
 * A Column Chart represents categorical data with vertical rectangular bars
 * with heights proportional to the values that they represent.
 * More info on [Sisense Documentation page](https://docs.sisense.com/main/SisenseLinux/column-chart.htm).
 *
 * @example
 * Example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <ColumnChart
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
 * <img src="media://column-chart-example-1.png" width="800"/>
 * @param props - Column chart properties
 * @returns Column Chart component
 */
export const ColumnChart = (props: ColumnChartProps) => {
  useTrackComponentInit('ColumnChart', props);

  return (
    <TrackingContextProvider>
      <Chart {...props} chartType="column" />
    </TrackingContextProvider>
  );
};
