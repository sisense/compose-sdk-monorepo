import type { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types';
import type { CustomWidgetProps } from '@/domains/widgets/components/custom-widget/types';

/**
 * Resolves the `widgetName` tracking field for a chart widget — the visualization subtype
 * (e.g. `'line'`, `'column'`, `'pie'`, `'streamgraph'`).
 *
 * @internal
 */
export const getChartWidgetName = (props: Pick<ChartWidgetProps, 'chartType'>): string =>
  props.chartType;

/**
 * Resolves the `widgetName` tracking field for a pivot table widget.
 *
 * @internal
 */
export const getPivotWidgetName = (): string => 'pivot';

/**
 * Resolves the `widgetName` tracking field for a text widget.
 *
 * @internal
 */
export const getTextWidgetName = (): string => 'text';

/**
 * Resolves the `widgetName` tracking field for a custom widget — the registered plugin name
 * (e.g. `'my-org-bullet-chart'`).
 *
 * @internal
 */
export const getCustomWidgetName = (props: Pick<CustomWidgetProps, 'customWidgetType'>): string =>
  props.customWidgetType;

/**
 * Reads the widget's user-facing title from props if present, otherwise `null`.
 *
 * Typed with a generic + intersection so callers preserve their concrete widget prop type
 * (`ChartWidgetProps`, `PivotTableWidgetProps`, …) while making the contract — "I read an
 * optional `title`" — explicit. The intersection sidesteps the weak-type heuristic that
 * would otherwise reject `TextWidgetProps`, which declares no `title`.
 *
 * @internal
 */
export const getWidgetTitle = <P extends object>(props: P & { title?: string }): string | null =>
  props.title ?? null;
