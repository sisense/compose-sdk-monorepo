import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { FunnelChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component representing data progressively decreasing in size or quantity through a funnel shape.
 *
 * @example
 * Funnel chart displaying data from the Sample ECommerce data model.
 *
 * ```tsx
 * import { FunnelChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <FunnelChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       category: [DM.Commerce.AgeRange],
 *       value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     }}
 *     styleOptions={{
 *       funnelType: 'regular',
 *       funnelSize: 'regular',
 *       funnelDirection: 'regular',
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://funnel-chart-example-1.png" width="700px" />
 *
 * @param props - Funnel chart properties
 * @returns Funnel Chart component
 * @group Charts
 */
export const FunnelChart = asSisenseComponent({
  componentName: 'FunnelChart',
  shouldSkipSisenseContextWaiting,
})((props: FunnelChartProps) => {
  return <Chart {...props} chartType="funnel" />;
});
