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

describe('useWidgetCsvDownload', () => {
  it('merges panel-level enabled into widget config when widget has no override', () => {
    const widgets = [chartWidget()];
    const { result } = renderHook(() => useWidgetCsvDownload({ widgets, enabled: true }));

    expect(result.current.widgets[0]?.config?.actions?.downloadCsv?.enabled).toBe(true);
  });

  it('widget-level downloadCsv.enabled takes precedence over the panel default', () => {
    const widgets = [
      chartWidget({
        config: { actions: { downloadCsv: { enabled: false } } },
      }),
    ];
    const { result } = renderHook(() => useWidgetCsvDownload({ widgets, enabled: true }));

    expect(result.current.widgets[0]?.config?.actions?.downloadCsv?.enabled).toBe(false);
  });
});
