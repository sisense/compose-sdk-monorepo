import { ColumnChartProps } from '../props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/as-sisense-component';

/**
 * A React component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
 * See [Column Chart](https://docs.sisense.com/main/SisenseLinux/column-chart.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <ColumnChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
 *   onDataPointClick={(point, nativeEvent) => {
 *     console.log('clicked', point, nativeEvent);
 *   }}
 * />
 * ```
 * ###
 * <img src="media://column-chart-example-1.png" width="800"/>
 * @param props - Column chart properties
 * @returns Column Chart component
 */
export const ColumnChart = asSisenseComponent({
  componentName: 'ColumnChart',
  shouldSkipSisenseContextWaiting,
})((props: ColumnChartProps) => {
  return <Chart {...props} chartType="column" />;
});
