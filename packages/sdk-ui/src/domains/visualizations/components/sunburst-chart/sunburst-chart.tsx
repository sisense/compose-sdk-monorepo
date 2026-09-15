import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { SunburstChartProps } from '@/props';

import { Chart } from '../chart';
import { shouldSkipSisenseContextWaiting } from '../chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component displaying hierarchical data in the form of nested circle slices.
 *
 * This type of chart can be used in different scenarios, for example, to compare both categories and sub-categories.
 *
 * @example
 * Sunburst chart displaying total quantity, categorized by condition and age range, from the Sample ECommerce data model.
 *
 * ```tsx
 * import { SunburstChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <SunburstChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [DM.Commerce.Condition, DM.Commerce.AgeRange],
 *       value: [measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity')],
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://sunburst-chart-example-1.png" width="700px" />
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
