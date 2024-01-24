import { BoxplotChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component representing data in a way that visually describes the distribution, variability,
 * and center of a data set along an axis.
 * See [Boxplot Chart](https://docs.sisense.com/main/SisenseLinux/box-and-whisker-plot.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <BoxplotChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Category.Category],
 *     value: [DM.Commerce.Cost],
 *     boxType: 'iqr',
 *     outliersEnabled: true,
 *   }}
 *   filters={[
 *     filterFactory.members(DM.Category.Category, ['Calculators', 'DVD Players', 'Routers']),
 *     filterFactory.members(DM.Commerce.AgeRange, ['19-24']),
 *   ]}
 *   styleOptions={{
 *     seriesLabels: {
 *       enabled: true,
 *     }
 *   }}
 * />
 * ```
 *
 * <img src="media://boxplot-chart-example-1.png" width="600px" />
 * @param props - Boxplot chart properties
 * @returns Boxplot Chart component
 * @beta
 */
export const BoxplotChart = asSisenseComponent({
  componentName: 'BoxplotChart',
  shouldSkipSisenseContextWaiting,
})((props: BoxplotChartProps) => {
  return <Chart {...props} chartType="boxplot" />;
});
