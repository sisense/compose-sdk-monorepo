import { IndicatorChartProps } from '../props';
import { Chart } from './Chart';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * Indicator Chart Component.
 * An indicator chart is a chart that displays a single value.
 * More info on [Sisense Documentation page](https://docs.sisense.com/main/SisenseLinux/indicator.htm).
 *
 * @example
 * Example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <IndicatorChart
 *   dataOptions={{
 *     value: [
 *       {
 *         column: measures.sum(DM.Commerce.Revenue),
 *         numberFormatConfig: {
 *           name: 'Numbers',
 *           decimalScale: 2,
 *           trillion: true,
 *           billion: true,
 *           million: true,
 *           kilo: true,
 *           thousandSeparator: true,
 *           prefix: false,
 *           symbol: '$',
 *         },
 *       },
 *     ],
 *     secondary: [],
 *     min: [measures.constant(0)],
 *     max: [measures.constant(125000000)],
 *   }}
 *   filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
 *   styleOptions={{
 *     indicatorComponents: {
 *       title: {
 *         shouldBeShown: true,
 *         text: 'Total Revenue',
 *       },
 *       secondaryTitle: {
 *         text: '',
 *       },
 *       ticks: {
 *         shouldBeShown: true,
 *       },
 *       labels: {
 *         shouldBeShown: true,
 *       },
 *     },
 *     subtype: 'indicator/gauge',
 *     skin: 1,
 *   }}
 * />
 * ```
 * ###
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 * @param props - Indicator chart properties
 * @returns Indicator Chart component
 */
export const IndicatorChart = (props: IndicatorChartProps) => {
  useTrackComponentInit('IndicatorChart', props);

  return (
    <TrackingContextProvider>
      <Chart {...props} chartType="indicator" />
    </TrackingContextProvider>
  );
};
