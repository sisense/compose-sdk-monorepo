import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { extractDimensionsAndMeasures } from '@/infra/contexts/custom-widgets-provider/use-execute-custom-widget-query.js';

import { useCustomWidgetExcelDownload } from './use-custom-widget-excel-download.js';
import type { UseCustomWidgetExcelDownloadParams } from './use-custom-widget-excel-download.js';

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

vi.mock('@/infra/contexts/custom-widgets-provider/use-execute-custom-widget-query.js', () => ({
  extractDimensionsAndMeasures: vi.fn(),
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

const baseParams: UseCustomWidgetExcelDownloadParams = {
  customWidgetType: 'my-widget',
  dataOptions: {},
  title: 'Custom',
  dataSource: undefined,
  filters: undefined,
  highlights: undefined,
  config: { actions: { downloadExcel: { enabled: true } } },
  baseHeaderConfig: { toolbar: { menu: { items: [] } } },
};

describe('useCustomWidgetExcelDownload', () => {
  beforeEach(() => {
    latestOnDownloadExcel.fn = null;
    appSettingsFeatureFlags.exportingXlsxV2Active = true;
    mockExecute.mockClear();
    vi.mocked(extractDimensionsAndMeasures).mockReturnValue({ dimensions: [], measures: [] });
  });

  it('does not expose Excel download when there are no dimensions or measures', () => {
    const { result } = renderHook(() => useCustomWidgetExcelDownload(baseParams));

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not expose Excel when exportingXlsxV2.active is false', () => {
    appSettingsFeatureFlags.exportingXlsxV2Active = false;
    vi.mocked(extractDimensionsAndMeasures).mockReturnValue({
      dimensions: [{ name: 'd' } as never],
      measures: [],
    });

    const { result } = renderHook(() => useCustomWidgetExcelDownload(baseParams));

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeUndefined();
  });

  it('calls loader with mergeRows false for repeat rows', () => {
    vi.mocked(extractDimensionsAndMeasures).mockReturnValue({
      dimensions: [{ name: 'd' } as never],
      measures: [{ name: 'm' } as never],
    });

    const { result } = renderHook(() => useCustomWidgetExcelDownload({ ...baseParams, id: 'w-1' }));

    act(() => {
      findExcelRepeatRowsOnClick(result.current.headerConfig)?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: [{ name: 'd' }],
        measures: [{ name: 'm' }],
        mergeRows: false,
        widgetType: 'my-widget',
        widgetId: 'w-1',
        filename: 'Custom.xlsx',
      }),
    );
  });

  it('calls loader with mergeRows true for merge rows', () => {
    vi.mocked(extractDimensionsAndMeasures).mockReturnValue({
      dimensions: [{ name: 'd' } as never],
      measures: [{ name: 'm' } as never],
    });

    const { result } = renderHook(() => useCustomWidgetExcelDownload(baseParams));

    act(() => {
      findExcelMergeRowsOnClick(result.current.headerConfig)?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({ mergeRows: true }));
  });
});
