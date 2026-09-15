import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { AreamapChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component for visualizing geographical data as colored polygons on a map.
 *
 * For another way do display data on a map, see {@link @sisense/sdk-ui!ScattermapChart | `ScattermapChart`}.
 *
 * @example
 * Areamap chart displaying total revenue per country from the Sample ECommerce data model. The total revenue amount is indicated by the colors on the map.
 *
 * ```tsx
 * import { AreamapChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <AreamapChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       geo: [DM.Country.Country],
 *       color: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     }}
 *     styleOptions={{ mapType: 'world' }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://areamap-chart-example-1.png" width="700px" />
 *
 * @param props - Areamap chart properties
 * @returns Areamap Chart component
 * @group Charts
 */
export const AreamapChart = asSisenseComponent({
  componentName: 'AreamapChart',
  shouldSkipSisenseContextWaiting,
})((props: AreamapChartProps) => {
  return <Chart {...props} chartType="areamap" />;
});
