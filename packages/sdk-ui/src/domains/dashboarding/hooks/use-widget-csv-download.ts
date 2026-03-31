import { useMemo } from 'react';

import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

export type UseWidgetCsvDownloadParams = {
  widgets: WidgetProps[];
  /**
   * CSV download enabled value from `config.widgetsPanel.actions.downloadCsv.enabled`.
   * Per-widget `config.actions.downloadCsv.enabled` overrides when explicitly set.
   */
  enabled: boolean;
};

/**
 * Applies dashboard-level CSV download settings to each widget's `config`.
 *
 * Reads `config.widgetsPanel.actions.downloadCsv.enabled` and merges it into
 * `widget.config.actions.downloadCsv` for every widget.
 * Widget-level `config.actions.downloadCsv.enabled` takes precedence when defined, so the dashboard-level config acts as a
 * default rather than replacing explicit widget configuration.
 *
 * @param params - Widgets and panel-level CSV toggle
 * @returns Widgets with resolved `config.actions.downloadCsv.enabled`
 * @internal
 */
export function useWidgetCsvDownload({ widgets, enabled }: UseWidgetCsvDownloadParams): {
  widgets: WidgetProps[];
} {
  return useMemo(() => {
    const widgetsWithDownloadCsv = widgets.map((widget) => {
      if (widget.config?.actions?.downloadCsv?.enabled !== undefined) {
        return widget;
      }

      return {
        ...widget,
        config: {
          ...widget.config,
          actions: {
            ...widget.config?.actions,
            downloadCsv: {
              ...widget.config?.actions?.downloadCsv,
              enabled,
            },
          },
        },
      };
    });

    return { widgets: widgetsWithDownloadCsv };
  }, [widgets, enabled]);
}
