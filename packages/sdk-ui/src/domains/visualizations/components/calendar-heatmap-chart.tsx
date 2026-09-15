import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { CalendarHeatmapChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that visualizes values over days in a calendar-like view,
 * making it easy to identify daily patterns or anomalies
 *
 * @param props - Calendar Heatmap chart properties
 * @returns Calendar Heatmap Chart component
 * @group Charts
 * @example
 * ```tsx
 * import { CalendarHeatmapChart } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <CalendarHeatmapChart
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       date: DM.Commerce.Date.Days,
 *       value: { column: measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity') },
 *     }}
 *     styleOptions={{ viewType: 'quarter' }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://calendar-heatmap-chart-example-1.png" width="700px" />
 */
export const CalendarHeatmapChart = asSisenseComponent({
  componentName: 'CalendarHeatmapChart',
  shouldSkipSisenseContextWaiting,
})((props: CalendarHeatmapChartProps) => {
  return <Chart {...props} chartType="calendar-heatmap" />;
});
