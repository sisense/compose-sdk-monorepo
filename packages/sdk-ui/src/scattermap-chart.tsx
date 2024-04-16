import { ScattermapChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component that allows to visualize geographical data as data points on a map.
 *
 * ## Example
 *
 * Scatter map chart displaying cost and revenue rank from the Sample ECommerce data model. The cost is indicated by size of each point and the revenue rank is indicated by the point's size.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fmap-scatter&mode=docs'
 *  width=1000
 *  height=900
 *  style='border:none;'
 * />
 *
 * @param props - Scattermap chart properties
 * @returns Scattermap Chart component
 * @group Charts
 * @beta
 */
export const ScattermapChart = asSisenseComponent({
  componentName: 'ScattermapChart',
  shouldSkipSisenseContextWaiting,
})((props: ScattermapChartProps) => {
  return <Chart {...props} chartType="scattermap" />;
});
