import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { PieChartProps } from '@/props';

import { Chart } from '../chart';
import { shouldSkipSisenseContextWaiting } from '../chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component representing data in a circular graph with the data shown as slices of a whole,
 * with each slice representing a proportion of the total.
 *
 * ## Example
 *
 * Pie chart displaying total revenue per age range from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fpie-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional Pie Chart examples:
 *
 * - [Donut Pie Chart](https://www.sisense.com/developers/playground/?example=charts%2Fpie-chart-donut)
 * - [Ring Pie Chart](https://www.sisense.com/developers/playground/?example=charts%2Fpie-chart-ring)
 *
 * @param props - Pie chart properties
 * @returns Pie Chart component
 * @group Charts
 */
export const PieChart = asSisenseComponent({
  componentName: 'PieChart',
  shouldSkipSisenseContextWaiting,
})((props: PieChartProps) => {
  return <Chart {...props} chartType="pie" />;
});
