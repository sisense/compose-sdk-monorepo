import { PolarChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component comparing multiple categories/variables with a spacial perspective in a radial chart.
 * See [Polar Chart](https://docs.sisense.com/main/SisenseLinux/polar-chart.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <PolarChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
 *   onDataPointClick= {(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 *
 * <img src="media://polar-chart-example-1.png" width="600px" />
 * @param props - Polar chart properties
 * @returns Polar Chart component
 */
export const PolarChart = asSisenseComponent({
  componentName: 'PolarChart',
  shouldSkipSisenseContextWaiting,
})((props: PolarChartProps) => {
  return <Chart {...props} chartType="polar" />;
});
