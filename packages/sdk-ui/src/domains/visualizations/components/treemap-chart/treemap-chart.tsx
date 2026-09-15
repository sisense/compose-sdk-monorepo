import { asSisenseComponent } from '../../../../infra/decorators/component-decorators/as-sisense-component';
import { TreemapChartProps } from '../../../../props';
import { Chart } from '../chart';
import { shouldSkipSisenseContextWaiting } from '../chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component displaying hierarchical data in the form of nested rectangles.
 *
 * This type of chart can be used instead of a column chart for comparing a large number of categories and sub-categories.
 *
 * @example
 * Tree map chart displaying total revenue, categorized by condition and age range, from the Sample ECommerce data model.
 *
 * ```tsx
 * import { TreemapChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <TreemapChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [{ column: DM.Commerce.Condition, isColored: true }, DM.Commerce.AgeRange],
 *       value: [measureFactory.sum(DM.Commerce.Revenue)],
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://treemap-chart-example-1.png" width="700px" />
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
