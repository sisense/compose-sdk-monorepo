import { AreamapChartProps } from './props';
import { Chart } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';
/**
 * A React component for visualizing geographical data as colored polygons on a map.
 *
 * For another way do display data on a map, see {@link ScattermapChart}.
 *
 * ## Example
 *
 * Areamap chart displaying total revenue per country from the Sample ECommerce data model. The total revenue amount is indicated by the colors on the map.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fmap-area&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
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
