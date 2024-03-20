import { ScattermapChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component that allows to visualize geographical data as data points on a map.
 * See [Scattermap Chart](https://docs.sisense.com/main/SisenseLinux/scatter-map.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <ScattermapChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     locations: [DM.Country.Country],
 *     size: measureFactory.sum(DM.Commerce.Cost, 'Size by Cost'),
 *     colorBy: {
 *       column: measureFactory.sum(DM.Commerce.Revenue, 'Color by Revenue'),
 *       color: 'green'
 *     },
 *     details: DM.Category.Category,
 *   }}
 *   styleOptions={{
 *     markers: {
 *       fill: 'hollow-bold'
 *     }
 *   }}
 * />
 * ```
 *
 * <img src="media://scattermap-chart-example-1.png" width="600px" />
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
