import type { WidgetNarrativeConfig } from '@/domains/narrative/core/widget-narrative-config';
import type { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types.js';
import type { PivotTableWidgetProps } from '@/domains/widgets/components/pivot-table-widget/types.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

type WidgetPropsWithNarrativeSupport =
  | ChartWidgetProps
  | PivotTableWidgetProps
  | Extract<WidgetProps, { widgetType: 'chart' } | { widgetType: 'pivot' }>;

/**
 * Returns narrative config from chart or pivot widget props (`config.narrative`).
 *
 * @param props - Chart or pivot widget props (standalone or {@link WidgetProps} chart/pivot branches)
 * @returns `WidgetNarrativeConfig` when present
 * @internal
 */
export function getWidgetNarrativeConfigFromWidgetProps(
  props: WidgetPropsWithNarrativeSupport,
): WidgetNarrativeConfig | undefined {
  return props.config?.narrative;
}
