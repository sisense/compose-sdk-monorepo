import { TreemapChartProps } from './props';
import { Chart } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';
/**
 * A React component displaying hierarchical data in the form of nested rectangles.
 *
 * This type of chart can be used instead of a column chart for comparing a large number of categories and sub-categories.
 *
 * ## Example
 *
 * Tree map chart displaying total revenue, categorized by condition and age range, from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Ftreemap-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * @param props - Treemap chart properties
 * @returns Treemap Chart component
 * @group Charts
 */
export const TreemapChart = asSisenseComponent({
  componentName: 'TreemapChart',
  shouldSkipSisenseContextWaiting,
})((props: TreemapChartProps) => {
  return <Chart {...props} chartType="treemap" />;
});
