import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import type { GenericDataOptions } from '@/types';

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

const dataOptionsWithQuery: GenericDataOptions = {
  categories: [{ column: DM.Commerce.AgeRange }],
  values: [{ column: measureFactory.sum(DM.Commerce.Revenue) }],
};

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
  config: { actions: { downloadExcel: { enabled: true } } },
  baseHeaderConfig: { toolbar: { menu: { items: [] } } },
};

describe('useCustomWidgetExcelDownload', () => {
  beforeEach(() => {
    latestOnDownloadExcel.fn = null;
    mockExecute.mockClear();
  });

  it('does not expose Excel download when there are no dimensions or measures', () => {
    const { result } = renderHook(() => useCustomWidgetExcelDownload(baseParams));

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('calls loader with mergeRows false for repeat rows', () => {
    const { result } = renderHook(() =>
      useCustomWidgetExcelDownload({
        ...baseParams,
        dataOptions: dataOptionsWithQuery,
        id: 'w-1',
      }),
    );

    act(() => {
      findExcelRepeatRowsOnClick(result.current.headerConfig)?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: expect.any(Array),
        measures: expect.any(Array),
        mergeRows: false,
        widgetType: 'my-widget',
        widgetId: 'w-1',
        filename: 'Custom.xlsx',
      }),
    );
    expect(mockExecute.mock.calls[0]?.[0]?.dimensions).toHaveLength(1);
    expect(mockExecute.mock.calls[0]?.[0]?.measures).toHaveLength(1);
  });

  it('calls loader with mergeRows true for merge rows', () => {
    const { result } = renderHook(() =>
      useCustomWidgetExcelDownload({ ...baseParams, dataOptions: dataOptionsWithQuery }),
    );

    act(() => {
      findExcelMergeRowsOnClick(result.current.headerConfig)?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({ mergeRows: true }));
  });

  it('passes filters to loader execute on download', () => {
    const filters = [filterFactory.members(DM.Commerce.Gender, ['Male'])];

    const { result } = renderHook(() =>
      useCustomWidgetExcelDownload({
        ...baseParams,
        dataOptions: dataOptionsWithQuery,
        filters,
      }),
    );

    act(() => {
      findExcelRepeatRowsOnClick(result.current.headerConfig)?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        filters,
        mergeRows: false,
      }),
    );
  });
});
