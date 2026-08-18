import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import { useWidgetExcelDownload } from './use-widget-excel-download.js';

const chartWidget = (overrides?: Partial<WidgetProps>): WidgetProps =>
  ({
    id: 'w1',
    widgetType: 'chart',
    chartType: 'column',
    dataOptions: {},
    ...overrides,
  } as WidgetProps);

const filterWidget = (): WidgetProps =>
  ({
    id: 'w2',
    widgetType: 'filter',
    attribute: { name: 'Country' },
  } as WidgetProps);

/** Reads the resolved Excel download flag, which only export-capable widgets carry. */
const downloadExcelEnabled = (widget?: WidgetProps): boolean | undefined =>
  widget && widget.widgetType !== 'text' && widget.widgetType !== 'filter'
    ? widget.config?.actions?.downloadExcel?.enabled
    : undefined;

describe('useWidgetExcelDownload', () => {
  it('merges dashboard-level enabled into widget config when widget has no override', () => {
    const widgets = [chartWidget()];
    const { result } = renderHook(() => useWidgetExcelDownload({ widgets, enabled: true }));

    expect(downloadExcelEnabled(result.current.widgets[0])).toBe(true);
  });

  it('widget-level downloadExcel.enabled takes precedence over the dashboard-level config', () => {
    const widgets = [
      chartWidget({
        config: { actions: { downloadExcel: { enabled: false } } },
      }),
    ];
    const { result } = renderHook(() => useWidgetExcelDownload({ widgets, enabled: true }));

    expect(downloadExcelEnabled(result.current.widgets[0])).toBe(false);
  });

  it('keeps a widget-level opt-in when the dashboard-level config is disabled', () => {
    // The dashboard-level value may now come from the user's export permission, so the per-widget
    // override has to survive a denying dashboard default just as it survives a permissive one.
    const widgets = [
      chartWidget({
        config: { actions: { downloadExcel: { enabled: true } } },
      }),
    ];
    const { result } = renderHook(() => useWidgetExcelDownload({ widgets, enabled: false }));

    expect(downloadExcelEnabled(result.current.widgets[0])).toBe(true);
  });

  it('leaves widgets that do not support data export untouched', () => {
    const widgets = [filterWidget()];
    const { result } = renderHook(() => useWidgetExcelDownload({ widgets, enabled: true }));

    expect(result.current.widgets[0]).toBe(widgets[0]);
    expect(result.current.widgets[0]?.config).toBeUndefined();
  });
});
