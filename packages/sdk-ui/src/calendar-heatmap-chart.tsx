import { CalendarHeatmapChartProps } from './props';
import { Chart } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
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
 * <CalendarHeatmapChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     date: DM.Commerce.Date.Days,
 *     value: measureFactory.sum(DM.Commerce.Cost)
 *   }}
 *   styleOptions={{
 *     width: 800,
 *     height: 600,
 *     viewType: 'quarter'
 *   }}
 * />
 * ```
 */
export const CalendarHeatmapChart = asSisenseComponent({
  componentName: 'CalendarHeatmapChart',
  shouldSkipSisenseContextWaiting,
})((props: CalendarHeatmapChartProps) => {
  return <Chart {...props} chartType="calendar-heatmap" />;
});
