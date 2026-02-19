import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { BarChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
 *
 * ## Example
 *
 * Bar chart displaying total revenue per year from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fbar-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional Bar Chart examples:
 *
 * - [Stacked Bar Chart](https://www.sisense.com/developers/playground/?example=charts%2Fbar-chart-stacked)
 * - [Stacked Percentage Bar Chart](https://www.sisense.com/developers/playground/?example=charts%2Fbar-chart-stacked100)
 *
 * @param props - Bar chart properties
 * @returns Bar Chart component
 * @group Charts
 */
export const BarChart = asSisenseComponent({
  componentName: 'BarChart',
  shouldSkipSisenseContextWaiting,
})((props: BarChartProps) => {
  return <Chart {...props} chartType="bar" />;
});
