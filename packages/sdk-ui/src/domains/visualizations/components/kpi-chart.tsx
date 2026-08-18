import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { KpiChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component that displays a single headline metric as a card, optionally with a
 * sparkline of its trend and a readout comparing it against a baseline.
 *
 * Given just a measure, the card shows that number on its own. Adding a `category` — typically
 * a date dimension — gives it a sparkline and a caption for the period being shown. Adding a
 * `comparison` makes it also report how the metric moved: against the previous period, against
 * a second measure, or against a target.
 *
 * @example
 * Monthly revenue with its trend and the change from the prior month:
 * ```tsx
 * <KpiChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     value: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *     category: DM.Commerce.Date.Months,
 *     comparison: { type: 'previous-period' },
 *   }}
 *   styleOptions={{
 *     title: { text: 'Revenue' },
 *     sparkline: { chartType: 'area' },
 *     card: { showBorder: true },
 *   }}
 * />
 * ```
 * @param props - KPI chart properties
 * @returns KPI Chart component
 * @group Charts
 */
export const KpiChart = asSisenseComponent({
  componentName: 'KpiChart',
  shouldSkipSisenseContextWaiting,
})((props: KpiChartProps) => {
  return <Chart {...props} chartType="kpi" />;
});
