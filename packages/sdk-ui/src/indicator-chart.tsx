import { IndicatorChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
 * See [Indicator](https://docs.sisense.com/main/SisenseLinux/indicator.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <IndicatorChart
 *   dataSet={DM.DataSource}
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
 *
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 * @param props - Indicator chart properties
 * @returns Indicator Chart component
 */
export const IndicatorChart = asSisenseComponent({
  componentName: 'IndicatorChart',
  shouldSkipSisenseContextWaiting,
})((props: IndicatorChartProps) => {
  return <Chart {...props} chartType="indicator" />;
});
