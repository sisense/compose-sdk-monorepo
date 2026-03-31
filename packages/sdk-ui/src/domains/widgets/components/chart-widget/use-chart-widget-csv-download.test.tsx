import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTranslatedDataOptions } from '@/domains/visualizations/components/chart/helpers/use-translated-data-options.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

import { useChartWidgetCsvDownload } from './use-chart-widget-csv-download.js';
import type { UseChartWidgetCsvDownloadParams } from './use-chart-widget-csv-download.js';

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/domains/widgets/hooks/use-csv-query-file-loader.js', () => ({
  useCsvQueryFileLoader: () => ({ execute: mockExecute }),
}));

vi.mock('@/domains/visualizations/components/chart/helpers/use-translated-data-options.js', () => ({
  getTranslatedDataOptions: vi.fn(),
}));

function findCsvOnClick(header: WidgetHeaderConfig): (() => void) | undefined {
  const download = header.toolbar?.menu?.items?.find((i) => i.id === 'widget-download');
  return download?.items?.find((i) => i.id === 'widget-download-csv-file')?.onClick;
}

const baseParams: UseChartWidgetCsvDownloadParams = {
  chartType: 'column',
  dataOptions: {},
  title: 'Revenue',
  filters: undefined,
  highlights: undefined,
  dataSource: undefined,
  config: { actions: { downloadCsv: { enabled: true } } },
  baseHeaderConfig: { toolbar: { menu: { items: [] } } },
};

describe('useChartWidgetCsvDownload', () => {
  beforeEach(() => {
    mockExecute.mockClear();
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [],
      measures: [],
      dataColumnNamesMapping: {},
    });
  });

  it('does not add CSV menu when chart has no dimensions or measures', () => {
    const { result } = renderHook(() => useChartWidgetCsvDownload(baseParams));

    expect(findCsvOnClick(result.current.headerConfig)).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('adds CSV menu and calls loader execute with query params when download is allowed', async () => {
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [{ name: 'dim' } as never],
      measures: [],
      dataColumnNamesMapping: {},
    });

    const { result } = renderHook(() => useChartWidgetCsvDownload(baseParams));

    const onClick = findCsvOnClick(result.current.headerConfig);
    expect(onClick).toBeDefined();

    await act(async () => {
      onClick?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: [{ name: 'dim' }],
        measures: [],
        filename: 'Revenue.csv',
      }),
    );
  });
});
