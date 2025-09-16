import { CalendarHeatmapChartProps } from './props';
import { Chart } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';
/**
 * A React component representing a calendar heatmap chart.
 *
 * @param props - Calendar Heatmap chart properties
 * @returns Calendar Heatmap Chart component
 * @group Charts
 *
 * @internal
 */
export const CalendarHeatmapChart = asSisenseComponent({
  componentName: 'CalendarHeatmapChart',
  shouldSkipSisenseContextWaiting,
})((props: CalendarHeatmapChartProps) => {
  return <Chart {...props} chartType="calendar-heatmap" />;
});
