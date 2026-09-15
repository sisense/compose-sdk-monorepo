import { asSisenseComponent } from '../../../../infra/decorators/component-decorators/as-sisense-component';
import { BoxplotChartProps } from '../../../../props';
import { Chart } from '../chart';
import { shouldSkipSisenseContextWaiting } from '../chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component representing data in a way that visually describes the distribution,
 * variability, and center of a data set along an axis.
 *
 * @example
 * Boxplot chart displaying data from the Sample ECommerce data model.
 *
 * ```tsx
 * import { BoxplotChart } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <BoxplotChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [DM.Commerce.Condition],
 *       value: [{ column: DM.Commerce.Cost, name: 'Total Cost' }],
 *       boxType: 'iqr',
 *       outliersEnabled: true,
 *     }}
 *     styleOptions={{ subtype: 'boxplot/full' }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://boxplot-chart-example-1.png" width="700px" />
 *
 * @param props - Boxplot chart properties
 * @returns Boxplot Chart component
 * @group Charts
 */
export const BoxplotChart = asSisenseComponent({
  componentName: 'BoxplotChart',
  shouldSkipSisenseContextWaiting,
})((props: BoxplotChartProps) => {
  return <Chart {...props} chartType="boxplot" />;
});
