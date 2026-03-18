import { useMemo } from 'react';

import type { WidgetChangeEvent } from '@/domains/widgets/change-events.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import type { DashboardPersistenceManager } from '../../types.js';

/** Options for the widget renaming middleware hook. */
export type UseWidgetRenamingParams = {
  /** Current widgets. */
  widgets: WidgetProps[];
  /** When false, returns widgets unchanged (no config.header.title.editing.enabled, no persistence wrap). */
  enabled?: boolean;
  /** When provided, persists widget renames to the server on title/changed. */
  persistence?: Pick<DashboardPersistenceManager, 'patchWidget'>;
};

/** Output of the widget renaming middleware. */
export type WidgetRenamingOutput = {
  widgets: WidgetProps[];
};

/**
 * Middleware hook that enables widget-level rename UI and optionally persists renames.
 * Sets config.header.title.editing.enabled on each widget so ChartWidget/PivotTableWidget show rename UI.
 * When persistence is set, wraps widget onChange to call patchWidget on title/changed
 * before forwarding to the change-detection layer.
 *
 * @param options - Options containing widgets, enabled flag, and optional persistence.
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
      const base = {
        ...widget,
        config: {
          ...widget.config,
          header: {
            ...widget.config?.header,
            title: {
              ...widget.config?.header?.title,
              editing: { enabled: true },
            },
          },
        },
      };
      if (!persistence) return base;
      return {
        ...base,
        onChange: (event: WidgetChangeEvent) => {
          if (event.type === 'title/changed') {
            void persistence.patchWidget(widget.id, { title: event.payload.title }).catch((err) => {
              console.error('[useWidgetRenaming] Failed to persist widget rename:', err);
            });
          }
          if ('onChange' in widget && typeof widget.onChange === 'function') {
            (widget.onChange as (e: WidgetChangeEvent) => void)(event);
          }
        },
      };
    });
  }, [widgets, enabled, persistence]);

  return { widgets: widgetsWithRenamePersistence };
}
