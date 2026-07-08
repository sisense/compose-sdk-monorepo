import { useCallback, useEffect, useMemo, useRef } from 'react';

import debounce from 'lodash-es/debounce';
import flow from 'lodash-es/flow';

import { deepMerge } from '@/domains/dashboarding/persistence/deep-merge';
import type { DashboardPersistenceManager } from '@/domains/dashboarding/persistence/types';
import type { WidgetPropsUpdate } from '@/domains/dashboarding/persistence/update-types';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import type { VisualizationStateUpdate } from '@/infra/plugins/widget-plugins/types';
import type { Navigator, TableStyleOptions } from '@/types';

/** Narrowed custom-widget variant of {@link WidgetProps}. */
type CustomWidgetProps = Extract<WidgetProps, { widgetType: 'custom' }>;

/** Identifies the custom-widget variant of the {@link WidgetProps} union. */
function isCustomWidgetProps(widget: WidgetProps): widget is CustomWidgetProps {
  return widget.widgetType === 'custom';
}

/** `styleOptions.columns` shape for table column-resize persistence, reused from {@link TableStyleOptions} to stay in sync with `types.ts`. */
type TableColumnsStyleOptions = { columns?: TableStyleOptions['columns'] };

/** Narrowed table-chart-widget variant of {@link WidgetProps} with typed `styleOptions.columns`. */
type TableChartWidgetProps = Extract<WidgetProps, { widgetType: 'chart' }> & {
  chartType: 'table';
  styleOptions: TableColumnsStyleOptions;
};

/**
 * Identifies table chart widgets eligible for resize-state persistence, i.e.
 * `styleOptions.columns.resizable !== false` (defaults to `true`). Shared by
 * `wireWidget` and `withTableColumnWidths` to keep the rule in one place.
 */
function isResizableTableChartWidget(widget: WidgetProps): widget is TableChartWidgetProps {
  return (
    widget.widgetType === 'chart' &&
    'chartType' in widget &&
    widget.chartType === 'table' &&
    'styleOptions' in widget &&
    !!widget.styleOptions &&
    // Narrowing by `widgetType`/`chartType` does not narrow `styleOptions` to the table-specific
    // shape, so cast to {@link TableColumnsStyleOptions} to read `columns.resizable`.
    (widget.styleOptions as TableColumnsStyleOptions).columns?.resizable !== false
  );
}

const DEBOUNCE_MS = 500;

type Persistence = Pick<DashboardPersistenceManager, 'updateWidget'> | undefined;

type DebouncedSaver = ReturnType<typeof debounce>;

/**
 * Composition middleware that adds persistable widget-update plumbing to a
 * widget list. For each widget that exposes a known runtime-state callback
 * (currently only `styleOptions.navigator.onScrollerChange` for charts with
 * a navigator, and `styleOptions.columns.onColumnsResize` for table charts with
 * resizable columns), the hook injects a handler that:
 *
 * 1. Applies the update optimistically to local widget state (the parent
 *    `useComposedDashboardInternal` re-renders with the new value).
 * 2. Schedules a debounced (500 ms) call to `persistence.updateWidget` with
 *    a {@link WidgetPropsUpdate}-shaped payload.
 *
 * When `persistence` is `undefined`, the optimistic apply still runs (so
 * visualizations behave correctly in read-only mode) and the persist call
 * is skipped.
 *
 * Errors during persistence are logged via `console.error`; the hook does
 * not roll back local state.
 *
 * @sisenseInternal
 */
export function useWidgetUpdatesPersistence(
  widgets: WidgetProps[],
  setWidgets: (updater: (prev: WidgetProps[]) => WidgetProps[]) => void,
  persistence?: Persistence,
): { widgets: WidgetProps[] } {
  const debouncersRef = useRef(new Map<string, DebouncedSaver>());
  // Per-widget accumulator of not-yet-flushed updates. Multiple updates emitted
  // within a single debounce window (e.g. a plugin changing `styleOptions` and
  // `customOptions` in the same handler) are deep-merged here so none is lost —
  // `debounce` alone keeps only the last call's arguments.
  const pendingRef = useRef(new Map<string, WidgetPropsUpdate>());

  useEffect(() => {
    const debouncers = debouncersRef.current;
    const pending = pendingRef.current;
    return () => {
      debouncers.forEach((d) => d.cancel());
      debouncers.clear();
      pending.clear();
    };
  }, [persistence]);

  const emit = useCallback(
    (oid: string, update: WidgetPropsUpdate) => {
      setWidgets((prev) => prev.map((w) => (w.id === oid ? applyOptimistic(w, update) : w)));
      if (!persistence) return;
      pendingRef.current.set(oid, mergeUpdates(pendingRef.current.get(oid), update));
      let saver = debouncersRef.current.get(oid);
      if (!saver) {
        saver = debounce(() => {
          const pendingUpdate = pendingRef.current.get(oid);
          pendingRef.current.delete(oid);
          if (!pendingUpdate) return;
          void persistence.updateWidget(oid, pendingUpdate).catch((err) => {
            console.error('[useWidgetUpdatesPersistence] updateWidget failed:', err);
          });
        }, DEBOUNCE_MS);
        debouncersRef.current.set(oid, saver);
      }
      saver();
    },
    [persistence, setWidgets],
  );

  const wiredWidgets = useMemo(
    () => widgets.map((widget) => wireWidget(widget, (update) => emit(widget.id, update))),
    [widgets, emit],
  );

  return { widgets: wiredWidgets };
}

function wireWidget(widget: WidgetProps, emit: (update: WidgetPropsUpdate) => void): WidgetProps {
  // Branch 1: chart widgets with a navigator scroller.
  if ('styleOptions' in widget && widget.styleOptions) {
    const styleOptions = widget.styleOptions as {
      navigator?: { enabled?: boolean; onScrollerChange?: (min: number, max: number) => void };
    } & typeof widget.styleOptions;
    if (styleOptions.navigator) {
      return {
        ...widget,
        styleOptions: {
          ...widget.styleOptions,
          navigator: {
            ...styleOptions.navigator,
            onScrollerChange: (min: number, max: number) => {
              emit({ styleOptions: { navigator: { scrollerLocation: { min, max } } } });
            },
          },
        },
      } as WidgetProps;
    }
  }

  // Branch 2: table chart widgets with resizable columns.
  if (isResizableTableChartWidget(widget)) {
    return {
      ...widget,
      styleOptions: {
        ...widget.styleOptions,
        columns: {
          ...widget.styleOptions.columns,
          onColumnsResize: (widths: number[]) => {
            emit({ styleOptions: { columns: { widths } } });
          },
        },
      },
    } as WidgetProps;
  }

  // Branch 3: custom (plugin) widgets. The plugin-facing `onChange`
  // callback is translated here from `VisualizationStateUpdate` into the internal
  // `WidgetPropsUpdate`, keeping the plugin API decoupled from the persistence type.
  // `customOptions` persists to the opaque DTO `customOptions` bag; `styleOptions`
  // persists to the opaque DTO `style` (see widget-plugin-persistence.md §4).
  if (isCustomWidgetProps(widget)) {
    return {
      ...widget,
      onChange: (update: VisualizationStateUpdate) => {
        if (update.styleOptions === undefined && update.customOptions === undefined) return;
        emit({
          ...(update.styleOptions !== undefined && { styleOptions: update.styleOptions }),
          ...(update.customOptions !== undefined && { customOptions: update.customOptions }),
        });
      },
    } as WidgetProps;
  }

  return widget;
}

/**
 * Deep-merges two persistable updates so distinct fields emitted within the same
 * debounce window are all retained (see {@link deepMerge} for the semantics).
 */
function mergeUpdates(
  prev: WidgetPropsUpdate | undefined,
  next: WidgetPropsUpdate,
): WidgetPropsUpdate {
  return prev ? deepMerge(prev, next) : next;
}

/** Applies the navigator scroll position from `update` to a chart widget. */
function withNavigatorScrollerLocation(update: WidgetPropsUpdate) {
  return (widget: WidgetProps): WidgetProps => {
    const scrollerLocation = update.styleOptions?.navigator?.scrollerLocation;
    const existingNavigator =
      'styleOptions' in widget
        ? (widget.styleOptions as { navigator?: Navigator }).navigator
        : undefined;
    if (!scrollerLocation || !existingNavigator) return widget;
    return {
      ...widget,
      styleOptions: {
        ...widget.styleOptions,
        navigator: { ...existingNavigator, scrollerLocation },
      },
    } as WidgetProps;
  };
}

/** Applies table column widths from `update` to a table chart widget. */
function withTableColumnWidths(update: WidgetPropsUpdate) {
  return (widget: WidgetProps): WidgetProps => {
    const widths = update.styleOptions?.columns?.widths;
    if (!widths || !isResizableTableChartWidget(widget)) {
      return widget;
    }

    return {
      ...widget,
      styleOptions: {
        ...widget.styleOptions,
        columns: {
          ...widget.styleOptions.columns,
          widths,
        },
      },
    } as WidgetProps;
  };
}

/**
 * Deep-merges non-navigator `styleOptions` from `update` into a custom widget.
 * Navigator scroll is handled separately by {@link withNavigatorScrollerLocation}.
 */
function withCustomWidgetStyleOptions(update: WidgetPropsUpdate) {
  return (widget: WidgetProps): WidgetProps => {
    if (!update.styleOptions || update.styleOptions.navigator || !isCustomWidgetProps(widget)) {
      return widget;
    }
    return { ...widget, styleOptions: deepMerge(widget.styleOptions ?? {}, update.styleOptions) };
  };
}

/** Deep-merges `customOptions` from `update` into a custom widget. */
function withCustomWidgetOptions(update: WidgetPropsUpdate) {
  return (widget: WidgetProps): WidgetProps => {
    if (!update.customOptions || !isCustomWidgetProps(widget)) return widget;
    return {
      ...widget,
      customOptions: deepMerge(widget.customOptions ?? {}, update.customOptions),
    };
  };
}

function applyOptimistic(widget: WidgetProps, update: WidgetPropsUpdate): WidgetProps {
  return flow(
    withNavigatorScrollerLocation(update),
    withTableColumnWidths(update),
    withCustomWidgetStyleOptions(update),
    withCustomWidgetOptions(update),
  )(widget);
}
