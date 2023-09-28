import { TreemapChartProps } from '../props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/as-sisense-component';

/**
 * A React component displaying hierarchical data in the form of nested rectangles.
 * This type of chart can be used in different scenarios, for example,
 * instead of a column chart if you have to compare too many categories and sub-categories.
 * See [Treemap Chart](https://docs.sisense.com/main/SisenseLinux/treemap.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <TreemapChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [
 *        {
 *          column: DM.Commerce.Сondition,
 *          isColored: true,
 *        },
 *        DM.Commerce.Date.Years
 *      ],
 *     value: [measures.sum(DM.Commerce.Quantity)],
 *   }}
 *   onDataPointClick= {(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 * ###
 * <img src="media://treemap-chart-example-1.png" width="600px" />
 * @param props - Treemap chart properties
 * @returns Treemap Chart component
 */
export const TreemapChart = asSisenseComponent({
  componentName: 'TreemapChart',
  shouldSkipSisenseContextWaiting,
})((props: TreemapChartProps) => {
  return <Chart {...props} chartType="treemap" />;
});
