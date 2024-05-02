import { ColumnChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
 *
 * The chart can include multiple values on both the X and Y-axis, as well as a break down by categories displayed on the Y-axis.
 *
 * ## Example
 *
 * Column chart displaying total revenue per year, broken down by condition, from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fcolumn-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 *
 * Additional Column Chart examples:
 *
 * - [Stacked Column Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts%2Fcolumn-chart-stacked)
 * - [Stacked Percentage Column Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts%2Fcolumn-chart-stacked100)
 *
 * @param props - Column chart properties
 * @returns Column Chart component
 * @group Charts
 */
export const ColumnChart = asSisenseComponent({
  componentName: 'ColumnChart',
  shouldSkipSisenseContextWaiting,
})((props: ColumnChartProps) => {
  return <Chart {...props} chartType="column" />;
});
