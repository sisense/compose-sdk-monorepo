import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTranslatedDataOptions } from '@/domains/visualizations/components/chart/helpers/use-translated-data-options.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

import { useChartWidgetExcelDownload } from './use-chart-widget-excel-download.js';
import type { UseChartWidgetExcelDownloadParams } from './use-chart-widget-excel-download.js';

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/domains/widgets/hooks/use-excel-query-file-loader.js', () => ({
  useExcelQueryFileLoader: () => ({ execute: mockExecute }),
}));

vi.mock('@/domains/visualizations/components/chart/helpers/use-translated-data-options.js', () => ({
  getTranslatedDataOptions: vi.fn(),
}));

const latestOnDownloadExcel = vi.hoisted(() => ({
  fn: null as null | ((mergeRows: boolean) => void),
}));

vi.mock('@/domains/widgets/hooks/use-with-excel-download-menu-item.js', async (importOriginal) => {
  const mod = await importOriginal<
    typeof import('@/domains/widgets/hooks/use-with-excel-download-menu-item.js')
  >();
  return {
    ...mod,
    useWithExcelDownloadMenuItem: (
      params: Parameters<typeof mod.useWithExcelDownloadMenuItem>[0],
    ) => {
      latestOnDownloadExcel.fn = params.onDownloadExcel;
      return mod.useWithExcelDownloadMenuItem(params);
    },
  };
});

const appSettingsFeatureFlags = vi.hoisted(() => ({
  exportingXlsxV2Active: true,
}));

vi.mock('@/shared/hooks/use-app-settings.js', () => ({
  useAppSettings: () => ({
    serverFeatures: { exportingXlsxV2: { active: appSettingsFeatureFlags.exportingXlsxV2Active } },
  }),
}));

function findExcelRepeatRowsOnClick(header: WidgetHeaderConfig): (() => void) | undefined {
  const download = header.toolbar?.menu?.items?.find((i) => i.id === 'widget-download');
  const excelFile = download?.items?.find((i) => i.id === 'excelFileMenuItem');
  return excelFile?.items?.find((i) => i.id === 'downloadExcelRepeatRows')?.onClick;
}

function findExcelMergeRowsOnClick(header: WidgetHeaderConfig): (() => void) | undefined {
  const download = header.toolbar?.menu?.items?.find((i) => i.id === 'widget-download');
  const excelFile = download?.items?.find((i) => i.id === 'excelFileMenuItem');
  return excelFile?.items?.find((i) => i.id === 'downloadExcelMergeRows')?.onClick;
}

const baseParams: UseChartWidgetExcelDownloadParams = {
  chartType: 'column',
  dataOptions: {},
  title: 'Revenue',
  dataSource: undefined,
  config: { actions: { downloadExcel: { enabled: true } } },
  baseHeaderConfig: { toolbar: { menu: { items: [] } } },
};

describe('useChartWidgetExcelDownload', () => {
  beforeEach(() => {
    latestOnDownloadExcel.fn = null;
    appSettingsFeatureFlags.exportingXlsxV2Active = true;
    mockExecute.mockClear();
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [],
      measures: [],
      dataColumnNamesMapping: {},
    });
  });

  it('does not add Excel menu when chart has no dimensions or measures', async () => {
    const { result } = renderHook(() => useChartWidgetExcelDownload(baseParams));

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();

    await act(async () => {
      latestOnDownloadExcel.fn?.(false);
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not add Excel menu or call loader when exportingXlsxV2.active is false (gated)', async () => {
    appSettingsFeatureFlags.exportingXlsxV2Active = false;
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [{ name: 'dim' } as never],
      measures: [],
      dataColumnNamesMapping: {},
    });

    const { result } = renderHook(() => useChartWidgetExcelDownload(baseParams));

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeUndefined();
    expect(findExcelMergeRowsOnClick(result.current.headerConfig)).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();

    await act(async () => {
      latestOnDownloadExcel.fn?.(false);
      latestOnDownloadExcel.fn?.(true);
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not add Excel menu when downloadExcel action is disabled', () => {
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [{ name: 'dim' } as never],
      measures: [],
      dataColumnNamesMapping: {},
    });

    const { result } = renderHook(() =>
      useChartWidgetExcelDownload({
        ...baseParams,
        config: { actions: { downloadExcel: { enabled: false } } },
      }),
    );

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not call loader when latest onDownloadExcel runs after downloadExcel is turned off', async () => {
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [{ name: 'dim' } as never],
      measures: [],
      dataColumnNamesMapping: {},
    });

    const { rerender } = renderHook(
      (p: UseChartWidgetExcelDownloadParams) => useChartWidgetExcelDownload(p),
      { initialProps: baseParams },
    );

    expect(latestOnDownloadExcel.fn).not.toBeNull();

    rerender({
      ...baseParams,
      config: { actions: { downloadExcel: { enabled: false } } },
    });

    await act(async () => {
      latestOnDownloadExcel.fn?.(false);
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not call loader when latest onDownloadExcel runs after chart loses dimensions', async () => {
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [{ name: 'dim' } as never],
      measures: [],
      dataColumnNamesMapping: {},
    });

    const { rerender } = renderHook(
      (p: UseChartWidgetExcelDownloadParams) => useChartWidgetExcelDownload(p),
      { initialProps: baseParams },
    );

    expect(latestOnDownloadExcel.fn).not.toBeNull();

    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [],
      measures: [],
      dataColumnNamesMapping: {},
    });
    rerender({ ...baseParams, dataOptions: { __rerender: 1 } as never });

    mockExecute.mockClear();
    await act(async () => {
      latestOnDownloadExcel.fn?.(false);
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not throw when measures omit format/getFormat (e.g. composed props)', () => {
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [{ name: 'dim' } as never],
      measures: [{ title: 'Revenue', name: 'rev' } as never],
      dataColumnNamesMapping: {},
    });

    const { result } = renderHook(() => useChartWidgetExcelDownload(baseParams));

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeDefined();
  });

  it('adds Excel menu and calls loader execute with mergeRows false for repeat rows', async () => {
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [{ name: 'dim' } as never],
      measures: [],
      dataColumnNamesMapping: {},
    });

    const { result } = renderHook(() => useChartWidgetExcelDownload(baseParams));

    const onClick = findExcelRepeatRowsOnClick(result.current.headerConfig);
    expect(onClick).toBeDefined();

    await act(async () => {
      onClick?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: [{ name: 'dim' }],
        measures: [],
        mergeRows: false,
        filename: 'Revenue.xlsx',
      }),
    );
  });

  it('calls loader execute with mergeRows true for merge rows', async () => {
    vi.mocked(getTranslatedDataOptions).mockReturnValue({
      dataOptions: {},
      attributes: [{ name: 'dim' } as never],
      measures: [],
      dataColumnNamesMapping: {},
    });

    const { result } = renderHook(() => useChartWidgetExcelDownload(baseParams));

    const onClick = findExcelMergeRowsOnClick(result.current.headerConfig);
    expect(onClick).toBeDefined();

    await act(async () => {
      onClick?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({ mergeRows: true }));
  });
});
