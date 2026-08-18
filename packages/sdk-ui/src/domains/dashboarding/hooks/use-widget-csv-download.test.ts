import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import { useWidgetCsvDownload } from './use-widget-csv-download.js';

const chartWidget = (overrides?: Partial<WidgetProps>): WidgetProps =>
  ({
    id: 'w1',
    widgetType: 'chart',
    chartType: 'column',
    dataOptions: {},
    ...overrides,
  } as WidgetProps);

const textWidget = (): WidgetProps =>
  ({
    id: 'w2',
    widgetType: 'text',
    styleOptions: { html: '<p>hi</p>', bgColor: '#fff', vAlign: 'valign-middle' },
  } as WidgetProps);

/** Reads the resolved CSV download flag, which only export-capable widgets carry. */
const downloadCsvEnabled = (widget?: WidgetProps): boolean | undefined =>
  widget && widget.widgetType !== 'text' && widget.widgetType !== 'filter'
    ? widget.config?.actions?.downloadCsv?.enabled
    : undefined;

describe('useWidgetCsvDownload', () => {
  it('merges dashboard-level enabled into widget config when widget has no override', () => {
    const widgets = [chartWidget()];
    const { result } = renderHook(() => useWidgetCsvDownload({ widgets, enabled: true }));

    expect(downloadCsvEnabled(result.current.widgets[0])).toBe(true);
  });

  it('widget-level downloadCsv.enabled takes precedence over the dashboard-level config', () => {
    const widgets = [
      chartWidget({
        config: { actions: { downloadCsv: { enabled: false } } },
      }),
    ];
    const { result } = renderHook(() => useWidgetCsvDownload({ widgets, enabled: true }));

    expect(downloadCsvEnabled(result.current.widgets[0])).toBe(false);
  });

  it('keeps a widget-level opt-in when the dashboard-level config is disabled', () => {
    // The dashboard-level value may now come from the user's export permission, so the per-widget
    // override has to survive a denying dashboard default just as it survives a permissive one.
    const widgets = [
      chartWidget({
        config: { actions: { downloadCsv: { enabled: true } } },
      }),
    ];
    const { result } = renderHook(() => useWidgetCsvDownload({ widgets, enabled: false }));

    expect(downloadCsvEnabled(result.current.widgets[0])).toBe(true);
  });

  it('leaves widgets that do not support data export untouched', () => {
    const widgets = [textWidget()];
    const { result } = renderHook(() => useWidgetCsvDownload({ widgets, enabled: true }));

    expect(result.current.widgets[0]).toBe(widgets[0]);
    expect(result.current.widgets[0]?.config).toBeUndefined();
  });
});
