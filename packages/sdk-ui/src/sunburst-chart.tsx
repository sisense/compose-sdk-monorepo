import { SunburstChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';

/**
 * A React component displaying hierarchical data in the form of nested circle slices.
 * This type of chart can be used in different scenarios, for example, to compare both categories and sub-categories.
 * See [Sunburst Chart](https://docs.sisense.com/main/SisenseLinux/sunburst-widget.htm) for more information.
 *
 * @example
 * An example of using the component to visualize the `Sample ECommerce` data source:
 * ```tsx
 * <SunburstChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [
 *        DM.Commerce.Сondition,
 *        DM.Commerce.Date.Years
 *      ],
 *     value: [measureFactory.sum(DM.Commerce.Quantity)],
 *   }}
 * />
 * ```
 *
 * <img src="media://sunburst-chart-example-1.png" width="600px" />
 * @param props - Sunburst chart properties
 * @returns Sunburst Chart component
 * @group Charts
 */
export const SunburstChart = asSisenseComponent({
  componentName: 'SunburstChart',
  shouldSkipSisenseContextWaiting,
})((props: SunburstChartProps) => {
  return <Chart {...props} chartType="sunburst" />;
});
