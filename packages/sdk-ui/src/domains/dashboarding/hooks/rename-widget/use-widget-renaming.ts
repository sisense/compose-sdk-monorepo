import { useMemo } from 'react';

import type { WidgetChangeEvent } from '@/domains/widgets/change-events.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import type { DashboardPersistenceManager } from '../../persistence/types.js';

/**
 * Widget variants whose `onChange` accepts a {@link WidgetChangeEvent} and whose
 * header supports inline title editing (see `useWidgetHeaderTitle`).
 */
type ChangeEventCapableWidgetProps = Extract<
  WidgetProps,
  { widgetType: 'chart' | 'pivot' | 'filter' | 'narrative' | 'custom' }
>;

/**
 * Identifies widgets that emit {@link WidgetChangeEvent} through `onChange`.
 *
 * @param widget - The widget to check.
 * @returns True for chart, pivot, filter, narrative and custom widgets.
 */
function isChangeEventCapableWidgetProps(
  widget: WidgetProps,
): widget is ChangeEventCapableWidgetProps {
  return (
    widget.widgetType === 'chart' ||
    widget.widgetType === 'pivot' ||
    widget.widgetType === 'filter' ||
    widget.widgetType === 'narrative' ||
    widget.widgetType === 'custom'
  );
}

/** Options for the widget renaming middleware hook. */
export type UseWidgetRenamingParams = {
  /** Current widgets. */
  widgets: WidgetProps[];
  /** When false, returns widgets unchanged (no config.header.title.editing.enabled, no persistence wrap). */
  enabled?: boolean;
  /** When provided, persists widget renames to the server on title/changed. */
  persistence?: Pick<DashboardPersistenceManager, 'updateWidget'>;
};

/** Output of the widget renaming middleware. */
export type WidgetRenamingOutput = {
  widgets: WidgetProps[];
};

/**
 * Middleware hook that enables widget-level rename UI and optionally persists renames.
 * Sets config.header.title.editing.enabled on each widget so the widget header shows rename UI.
 * When persistence is set, wraps widget onChange to call updateWidget on title/changed
 * before forwarding to the change-detection layer (which applies the new title locally).
 *
 * @param params - Options containing widgets, enabled flag, and optional persistence.
 * @returns Widgets with config.header.title.editing.enabled and optionally wrapped onChange.
 *
 * @example
 * ```ts
 * const { widgets: widgetsWithRename } = useWidgetRenaming({
 *   widgets: widgetsWithDuplicate,
 *   enabled: true,
 *   persistence,
 * });
 * ```
 */
export function useWidgetRenaming(params: UseWidgetRenamingParams): WidgetRenamingOutput {
  const { widgets, enabled = false, persistence } = params;

  const widgetsWithRenamePersistence = useMemo(() => {
    if (!enabled) return [...widgets];
    return widgets.map((widget) => {
      const editingEnabledConfig = {
        ...widget.config,
        header: {
          ...widget.config?.header,
          title: {
            ...widget.config?.header?.title,
            editing: { enabled: true },
          },
        },
      };
      // Only widgets that emit WidgetChangeEvent through `onChange` are wrapped;
      // wrapping other variants would clobber unrelated callbacks.
      if (persistence && isChangeEventCapableWidgetProps(widget)) {
        return {
          ...widget,
          config: editingEnabledConfig,
          onChange: (event: WidgetChangeEvent) => {
            if (event.type === 'title/changed') {
              void persistence
                .updateWidget(widget.id, { title: event.payload.title })
                .catch((err) => {
                  console.error('[useWidgetRenaming] Failed to persist widget rename:', err);
                });
            }
            // Safe: the wrapper only forwards events the wrapped widget itself emitted.
            (widget.onChange as ((e: WidgetChangeEvent) => void) | undefined)?.(event);
          },
        };
      }
      return { ...widget, config: editingEnabledConfig };
    });
  }, [widgets, enabled, persistence]);

  return { widgets: widgetsWithRenamePersistence };
}
