import { AreaChartProps } from './props';
import { Chart } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';
/**
 * A React component similar to a {@link @sisense/sdk-ui!LineChart | `LineChart`},
 * but with filled in areas under each line and an option to display them as stacked.
 *
 * ## Example
 *
 * Area chart displaying total revenue per quarter from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Farea-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional Area Chart examples:
 *
 * - [Stacked Area Chart](https://www.sisense.com/developers/playground/?example=charts%2Farea-chart-stacked)
 * - [Stacked Percentage Area Chart](https://www.sisense.com/developers/playground/?example=charts%2Farea-chart-stacked100)
 *
 * @param props - Area chart properties
 * @returns Area Chart component
 * @group Charts
 */
export const AreaChart = asSisenseComponent({
  componentName: 'AreaChart',
  shouldSkipSisenseContextWaiting,
})((props: AreaChartProps) => {
  return <Chart {...props} chartType="area" />;
});
