import { AreaChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
/**
 * A React component similar to a {@link LineChart},
 * but with filled in areas under each line and an option to display them as stacked.
 * More info on [Sisense Documentation page](https://docs.sisense.com/main/SisenseLinux/area-chart.htm).
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <AreaChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Date.Years],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   styleOptions={{ subtype: 'area/stacked' }}
 *   filters={[filters.members(DM.Commerce.Gender, ['Female', 'Male'])]}
 *   onDataPointClick={(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 *
 * <img src="media://area-chart-example-1.png" width="800"/>
 * @param props - Area chart properties
 * @returns Area Chart component
 */
export const AreaChart = asSisenseComponent({
  componentName: 'AreaChart',
  shouldSkipSisenseContextWaiting,
})((props: AreaChartProps) => {
  return <Chart {...props} chartType="area" />;
});
