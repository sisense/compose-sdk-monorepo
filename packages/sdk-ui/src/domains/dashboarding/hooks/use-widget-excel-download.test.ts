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

describe('useWidgetExcelDownload', () => {
  it('merges dashboard-level enabled into widget config when widget has no override', () => {
    const widgets = [chartWidget()];
    const { result } = renderHook(() => useWidgetExcelDownload({ widgets, enabled: true }));

    expect(result.current.widgets[0]?.config?.actions?.downloadExcel?.enabled).toBe(true);
  });

  it('widget-level downloadExcel.enabled takes precedence over the dashboard-level config', () => {
    const widgets = [
      chartWidget({
        config: { actions: { downloadExcel: { enabled: false } } },
      }),
    ];
    const { result } = renderHook(() => useWidgetExcelDownload({ widgets, enabled: true }));

    expect(result.current.widgets[0]?.config?.actions?.downloadExcel?.enabled).toBe(false);
  });
});
