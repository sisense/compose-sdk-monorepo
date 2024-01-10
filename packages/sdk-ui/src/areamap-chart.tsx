import { AreamapChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component for visualizing geographical data as polygons on a map.
 * See [Areamap Chart](https://docs.sisense.com/main/SisenseLinux/area-map.htm) for more information.
 *
 * This component is still in beta.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <AreamapChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     geo: [DM.Country.Country],
 *     color: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
 *   }}
 *   styleOptions={{
 *     mapType: 'world',
 *   }}
 * />
 * ```
 *
 * @param props - Areamap chart properties
 * @returns Areamap Chart component
 * @beta
 */
export const AreamapChart = asSisenseComponent({
  componentName: 'AreamapChart',
  shouldSkipSisenseContextWaiting,
})((props: AreamapChartProps) => {
  return <Chart {...props} chartType="areamap" />;
});
