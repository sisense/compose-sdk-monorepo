import { SunburstChartProps } from './props';
import { Chart, shouldSkipSisenseContextWaiting } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';

/**
 * A React component displaying hierarchical data in the form of nested circle slices.
 *
 * This type of chart can be used in different scenarios, for example, to compare both categories and sub-categories.
 *
 * ## Example
 *
 * Sunburst chart displaying total revenue, categorized by condition and age range, from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fsunburst-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
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
