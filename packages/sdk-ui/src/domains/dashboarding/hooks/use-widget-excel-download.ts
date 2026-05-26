import { useMemo } from 'react';

import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

export type UseWidgetExcelDownloadParams = {
  widgets: WidgetProps[];
  /**
   * Excel download enabled value from `config.widgetsPanel.actions.downloadExcel.enabled`.
   * Per-widget `config.actions.downloadExcel.enabled` overrides when explicitly set.
   */
  enabled: boolean;
};

/**
 * Applies dashboard-level Excel download settings to each widget's `config`.
 *
 * Reads `config.widgetsPanel.actions.downloadExcel.enabled` and merges it into
 * `widget.config.actions.downloadExcel` for every widget.
 * Widget-level `config.actions.downloadExcel.enabled` takes precedence when defined, so the dashboard-level config acts as a
 * default rather than replacing explicit widget configuration.
 *
 * @param params - Widgets and panel-level Excel toggle
 * @returns Widgets with resolved `config.actions.downloadExcel.enabled`
 */
export function useWidgetExcelDownload({ widgets, enabled }: UseWidgetExcelDownloadParams): {
  widgets: WidgetProps[];
} {
  return useMemo(() => {
    const widgetsWithDownloadExcel = widgets.map((widget) => {
      if (widget.config?.actions?.downloadExcel?.enabled !== undefined) {
        return widget;
      }

      return {
        ...widget,
        config: {
          ...widget.config,
          actions: {
            ...widget.config?.actions,
            downloadExcel: {
              ...widget.config?.actions?.downloadExcel,
              enabled,
            },
          },
        },
      };
    });

    return { widgets: widgetsWithDownloadExcel };
  }, [widgets, enabled]);
}
