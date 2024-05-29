import { FunnelChartProps } from './props';
import { Chart } from './chart';
import { asSisenseComponent } from './decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';
/**
 * A React component representing data progressively decreasing in size or quantity through a funnel shape.
 *
 * ## Example
 *
 * Funnel chart displaying data from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Ffunnel-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
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
