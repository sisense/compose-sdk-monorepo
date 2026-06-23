import type { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types.js';
import type { PivotTableWidgetProps } from '@/domains/widgets/components/pivot-table-widget/types.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';
import type { WidgetNarrativeOptions } from '@/types.js';

type WidgetPropsWithNarrativeSupport =
  | ChartWidgetProps
  | PivotTableWidgetProps
  | Extract<WidgetProps, { widgetType: 'chart' } | { widgetType: 'pivot' }>;

/**
 * Returns narrative options from chart or pivot widget props (`aiOptions.narrative`).
 *
 * @param props - Chart or pivot widget props (standalone or {@link WidgetProps} chart/pivot branches)
 * @returns `WidgetNarrativeOptions` when present
 * @internal
 */
export function getWidgetNarrativeOptionsFromWidgetProps(
  props: WidgetPropsWithNarrativeSupport,
): WidgetNarrativeOptions | undefined {
  return props.aiOptions?.narrative;
}
