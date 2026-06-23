import { isFilterRelations } from '@sisense/sdk-data';

import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { SankeyChartProps } from '../../../props';
import { Chart } from './chart';
import { shouldSkipSisenseContextWaiting } from './chart/helpers/should-skip-sisense-context-waiting';

/**
 * Sankey doesn't support highlight rendering, so any incoming highlight filters are folded into
 * regular slice filters here. FilterRelations can't be extended with extra items so highlights
 * are silently ignored in that case.
 */
function normalizeHighlightsToFilters(props: SankeyChartProps): SankeyChartProps {
  const { filters, highlights } = props;
  if (!highlights?.length) return props;
  const mergedFilters = isFilterRelations(filters) ? filters : [...(filters ?? []), ...highlights];
  return { ...props, filters: mergedFilters, highlights: undefined };
}

/**
 * A React component that visualizes flow and volume between nodes using a Sankey diagram.
 * Node width represents the total flow through that node; link width represents the flow
 * between two connected nodes.
 *
 * @beta
 *
 * ## Example
 *
 * ```tsx
 * <SankeyChart
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
 *     value: measureFactory.sum(DM.Commerce.Revenue),
 *   }}
 *   styleOptions={{
 *     orientation: 'horizontal',
 *     nodeAlignment: 'top',
 *   }}
 * />
 * ```
 *
 * @param props - Sankey chart properties
 * @returns Sankey Chart component
 * @group Charts
 */
export const SankeyChart = asSisenseComponent({
  componentName: 'SankeyChart',
  shouldSkipSisenseContextWaiting,
})((props: SankeyChartProps) => {
  return <Chart {...normalizeHighlightsToFilters(props)} chartType="sankey" />;
});
