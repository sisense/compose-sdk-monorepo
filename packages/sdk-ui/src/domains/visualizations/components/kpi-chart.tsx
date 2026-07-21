import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { KpiChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that displays a KPI card: primary value with an optional
 * sparkline trend and a comparison readout — previous period, another measure,
 * or a target.
 *
 * @example
 * ```tsx
 * <KpiChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     value: measureFactory.sum(DM.Commerce.Revenue),
 *     trend: DM.Commerce.Date.Months,
 *   }}
 * />
 * ```
 * @param props - KPI chart properties
 * @returns KPI Chart component
 * @group Charts
 * @beta
 */
export const KpiChart = asSisenseComponent({
  componentName: 'KpiChart',
  shouldSkipSisenseContextWaiting,
})((props: KpiChartProps) => {
  return <Chart {...props} chartType="kpi" />;
});
