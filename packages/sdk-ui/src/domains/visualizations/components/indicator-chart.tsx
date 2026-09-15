import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { IndicatorChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
 *
 * @example
 * ```tsx
 * import { IndicatorChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <IndicatorChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *       max: [measureFactory.constant(125000000)],
 *     }}
 *     styleOptions={{
 *       indicatorComponents: {
 *         title: { shouldBeShown: true, text: 'Total Revenue' },
 *         ticks: { shouldBeShown: false },
 *         labels: { shouldBeShown: true },
 *       },
 *       subtype: 'indicator/gauge',
 *       skin: 2,
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 *
 * Numeric indicator variant with a secondary value:
 *
 * ```tsx
 * <IndicatorChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     // secondary value is optional
 *     secondary: [measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity')],
 *   }}
 * />
 * ```
 *
 * <img src="media://indicator-chart-example-3.png" width="400px" />
 *
 * Ticker style indicator variant:
 *
 * ```tsx
 * <IndicatorChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     max: [measureFactory.constant(125000000)],
 *   }}
 *   styleOptions={{
 *     indicatorComponents: {
 *       title: { shouldBeShown: true, text: 'Total Revenue' },
 *       ticks: { shouldBeShown: false },
 *       labels: { shouldBeShown: true },
 *     },
 *     subtype: 'indicator/gauge',
 *     skin: 2,
 *     forceTickerView: true,
 *     tickerBarHeight: 30,
 *     width: 400,
 *   }}
 * />
 * ```
 *
 * <img src="media://indicator-chart-example-4.png" width="400px" />
 * @param props - Indicator chart properties
 * @returns Indicator Chart component
 * @group Charts
 */
export const IndicatorChart = asSisenseComponent({
  componentName: 'IndicatorChart',
  shouldSkipSisenseContextWaiting,
})((props: IndicatorChartProps) => {
  return <Chart {...props} chartType="indicator" />;
});
