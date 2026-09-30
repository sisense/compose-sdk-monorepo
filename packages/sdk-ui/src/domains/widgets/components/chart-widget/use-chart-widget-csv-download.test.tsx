import { measureFactory } from '@sisense/sdk-data';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { getTranslatedDataOptions } from '@/domains/visualizations/components/chart/helpers/use-translated-data-options.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets';
import { findMenuActionByPath } from '@/shared/types/__test-helpers__/find-menu-item.js';

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
  return findMenuActionByPath(
    header.menu?.items,
    WidgetHeaderMenuTargets.Download,
    WidgetHeaderMenuTargets.DownloadCsv,
  )?.onClick;
}

const baseParams: UseChartWidgetCsvDownloadParams = {
  chartType: 'column',
  dataOptions: {},
  title: 'Revenue',
  filters: undefined,
  highlights: undefined,
  dataSource: undefined,
  config: { actions: { downloadCsv: { enabled: true } } },
  baseHeaderConfig: { menu: { items: [] } },
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

  it('gives a date measure its display format, so the CSV reads as a date', async () => {
    const dateMeasure = measureFactory.max(DM.Commerce.Date.Days, 'Max Date');
    const numeric = measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue');
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [],
      measures: [dateMeasure, numeric],
      dataColumnNamesMapping: {},
    });

    const { result } = renderHook(() => useChartWidgetCsvDownload(baseParams));
    await act(async () => {
      findCsvOnClick(result.current.headerConfig)?.();
    });

    const { measures } = mockExecute.mock.calls[0][0];
    expect(measures[0].getFormat()).toBe('yyyy-MM-dd');
    // the numeric measure goes through by identity, so its CSV output cannot move
    expect(measures[1]).toBe(numeric);
  });
});
