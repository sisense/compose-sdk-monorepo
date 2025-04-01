import { LineChartProps } from './props';
import { Chart } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';
/**
 * A React component displaying data as a series of points connected by a line. Used to show trends or changes over time.
 *
 * ## Example
 *
 * Line chart displaying total revenue per quarter from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fline-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional Line Chart examples:
 *
 * - [Curved Line Chart](https://www.sisense.com/developers/playground/?example=charts%2Fline-chart-spline)
 * - [Styled Line Chart](https://www.sisense.com/developers/playground/?example=charts%2Fline-chart-styled)
 *
 * @param props - Line chart properties
 * @returns Line Chart component
 * @group Charts
 */
export const LineChart = asSisenseComponent({
  componentName: 'LineChart',
  shouldSkipSisenseContextWaiting,
})((props: LineChartProps) => {
  return <Chart {...props} chartType="line" />;
});
