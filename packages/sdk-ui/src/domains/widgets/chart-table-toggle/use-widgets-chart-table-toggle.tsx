import { useCallback, useMemo, useState } from 'react';

import { withHeaderItemsInConfig } from '@/domains/widgets/helpers/header-items-utils';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types';

import {
  type ChartTableToggleLabels,
  DEFAULT_CHART_TABLE_TOGGLE_LABELS,
} from './chart-table-toggle-button';
import { createChartTableToggleItem } from './chart-table-toggle-header-item';
import {
  applyChartTableOverride,
  hasTrendOrForecast,
  shouldShowChartTableToggle,
  toResetIdentity,
} from './chart-to-table-toggle';

/**
 * Loose widget shape so Compose SDK `WidgetProps` unions assign without extra casts.
 * Table-view state is keyed by `id`, then `title`, then a hash of the widget query.
 *
 * @sisenseInternal
 */
export type ChartTableToggleWidget = {
  widgetType?: string;
  id?: string;
  title?: string;
  chartType?: string;
  dataOptions?: unknown;
  config?: object;
};

/**
 * Options for {@link useWidgetsChartTableToggle}.
 *
 * @sisenseInternal
 */
export type UseWidgetsChartTableToggleOptions<
  T extends ChartTableToggleWidget = ChartTableToggleWidget,
> = {
  labels?: ChartTableToggleLabels;
  /** Primitive identity. Non-primitives are ignored so an inline object cannot loop. */
  resetKey?: string | number | boolean | null;
  isWidgetDisabled?: (widget: T) => boolean;
};

type WidgetConfigWithHeader = {
  header?: WidgetHeaderConfig;
};

function hashWidgetQuery(widget: ChartTableToggleWidget): string {
  const payload = JSON.stringify({
    chartType: widget.chartType ?? '',
    dataOptions: widget.dataOptions ?? null,
  });
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) + hash) ^ payload.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function widgetToggleId(widget: ChartTableToggleWidget): string {
  if (typeof widget.id === 'string' && widget.id.length > 0) {
    return widget.id;
  }
  if (typeof widget.title === 'string' && widget.title.length > 0) {
    return `__title:${widget.title}`;
  }
  return `__query:${hashWidgetQuery(widget)}`;
}

function dropStaleTableViews(
  widgets: readonly ChartTableToggleWidget[],
  tableById: Record<string, string | undefined>,
): Record<string, string | undefined> | undefined {
  let next: Record<string, string | undefined> | undefined;
  for (const widget of widgets) {
    const id = widgetToggleId(widget);
    if (!(id in tableById) || Object.is(tableById[id], widget.chartType)) {
      continue;
    }
    next ??= { ...tableById };
    delete next[id];
  }
  return next;
}

function withWidgetChartTableToggle<T extends ChartTableToggleWidget>(
  widget: T,
  isTableView: boolean,
  onTableViewChange: (pressed: boolean) => void,
  labels: ChartTableToggleLabels,
  disabled: boolean,
  disabledTitle?: string,
): T {
  if (
    widget.widgetType !== 'chart' ||
    !shouldShowChartTableToggle(widget.chartType, widget.dataOptions)
  ) {
    return widget;
  }

  const config = (
    typeof widget.config === 'object' && widget.config !== null ? widget.config : {}
  ) as WidgetConfigWithHeader;
  const toggleItem = createChartTableToggleItem({
    pressed: isTableView,
    onPressedChange: onTableViewChange,
    disabled,
    disabledTitle,
    labels,
  });

  return {
    ...widget,
    ...applyChartTableOverride(
      { chartType: widget.chartType, dataOptions: widget.dataOptions },
      isTableView,
    ),
    config: {
      ...config,
      header: withHeaderItemsInConfig([toggleItem])(config.header ?? {}),
    },
  } as T;
}

/**
 * Wires an in-memory chart↔table toggle onto dashboard chart widgets.
 * Keys table-view state by `id`, then `title`, then a hash of chart type + data options.
 *
 * @param widgets - Dashboard widgets
 * @param options - Labels, reset key, and per-widget disabled predicate
 * @returns Widgets with the toggle on eligible charts
 * @example
 * ```tsx
 * const widgets = useWidgetsChartTableToggle(dashboard.widgets, { resetKey: dashboard.oid });
 * return <Dashboard {...dashboard} widgets={widgets} />;
 * ```
 * @group Widgets
 * @sisenseInternal
 */
export function useWidgetsChartTableToggle<T extends ChartTableToggleWidget>(
  widgets: readonly T[] | undefined,
  options: UseWidgetsChartTableToggleOptions<T> = {},
): T[] {
  const labels = useMemo(
    () => ({
      ...DEFAULT_CHART_TABLE_TOGGLE_LABELS,
      ...options.labels,
    }),
    [options.labels],
  );
  const isWidgetDisabled = options.isWidgetDisabled;
  const resetKey = toResetIdentity(options.resetKey);
  const [resetSnapshot, setResetSnapshot] = useState(resetKey);
  const [tableByWidgetId, setTableByWidgetId] = useState<Record<string, string | undefined>>({});

  const resetChanged = !Object.is(resetSnapshot, resetKey);
  const baseTableById = resetChanged ? {} : tableByWidgetId;
  const reconciled =
    !resetChanged && widgets != null ? dropStaleTableViews(widgets, baseTableById) : undefined;
  const tableById = reconciled ?? baseTableById;

  if (resetChanged) {
    setResetSnapshot(resetKey);
    setTableByWidgetId({});
  } else if (reconciled != null) {
    setTableByWidgetId(reconciled);
  }

  const onTableViewChange = useCallback(
    (widgetId: string, chartType: string | undefined, pressed: boolean) => {
      setTableByWidgetId((prev) => {
        if (pressed) {
          return { ...prev, [widgetId]: chartType };
        }
        const next = { ...prev };
        delete next[widgetId];
        return next;
      });
    },
    [],
  );

  return useMemo(() => {
    if (!widgets) {
      return [];
    }
    return widgets.map((widget) => {
      const widgetId = widgetToggleId(widget);
      const unavailableForAdvancedAnalytics = hasTrendOrForecast(widget.dataOptions);
      return withWidgetChartTableToggle(
        widget,
        !unavailableForAdvancedAnalytics && widgetId in tableById,
        (pressed) => onTableViewChange(widgetId, widget.chartType, pressed),
        labels,
        Boolean(isWidgetDisabled?.(widget)) || unavailableForAdvancedAnalytics,
        unavailableForAdvancedAnalytics ? labels.unavailableWithTrendForecast : undefined,
      );
    });
  }, [widgets, tableById, onTableViewChange, labels, isWidgetDisabled]);
}
