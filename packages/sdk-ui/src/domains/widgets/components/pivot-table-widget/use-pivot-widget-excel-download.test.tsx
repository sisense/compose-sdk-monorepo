import { filterFactory } from '@sisense/sdk-data';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { translatePivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

import { usePivotWidgetExcelDownload } from './use-pivot-widget-excel-download.js';
import type { UsePivotWidgetExcelDownloadParams } from './use-pivot-widget-excel-download.js';

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

vi.mock('@/domains/visualizations/core/chart-data-options/translate-data-options.js', () => ({
  translatePivotTableDataOptions: vi.fn(),
}));

vi.mock('@/domains/visualizations/core/chart-data-options/utils.js', () => ({
  translateColumnToAttribute: vi.fn((col: unknown) => ({ name: 'attr', col })),
  translateColumnToMeasure: vi.fn((col: unknown) => ({ name: 'msr', col })),
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

const baseParams: UsePivotWidgetExcelDownloadParams = {
  dataOptions: {} as UsePivotWidgetExcelDownloadParams['dataOptions'],
  title: 'Pivot',
  filters: undefined,
  dataSource: undefined,
  config: { actions: { downloadExcel: { enabled: true } } },
  baseHeaderConfig: { toolbar: { menu: { items: [] } } },
};

describe('usePivotWidgetExcelDownload', () => {
  beforeEach(() => {
    latestOnDownloadExcel.fn = null;
    mockExecute.mockClear();
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);
  });

  it('does not add Excel menu when pivot has no rows, columns, or values', () => {
    const { result } = renderHook(() => usePivotWidgetExcelDownload(baseParams));

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();

    act(() => {
      latestOnDownloadExcel.fn?.(false);
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not add Excel menu when downloadExcel action is disabled', () => {
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [{ id: 'r1' } as never],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);

    const { result } = renderHook(() =>
      usePivotWidgetExcelDownload({
        ...baseParams,
        config: { actions: { downloadExcel: { enabled: false } } },
      }),
    );

    expect(findExcelRepeatRowsOnClick(result.current.headerConfig)).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not call loader when latest onDownloadExcel runs after downloadExcel is turned off', () => {
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [{ id: 'r1' } as never],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);

    const { rerender } = renderHook(
      (p: UsePivotWidgetExcelDownloadParams) => usePivotWidgetExcelDownload(p),
      { initialProps: baseParams },
    );

    expect(latestOnDownloadExcel.fn).not.toBeNull();

    rerender({
      ...baseParams,
      config: { actions: { downloadExcel: { enabled: false } } },
    });

    act(() => {
      latestOnDownloadExcel.fn?.(false);
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not call loader when latest onDownloadExcel runs after pivot loses dimensions', () => {
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [{ id: 'r1' } as never],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);

    const { rerender } = renderHook(
      (p: UsePivotWidgetExcelDownloadParams) => usePivotWidgetExcelDownload(p),
      { initialProps: baseParams },
    );

    expect(latestOnDownloadExcel.fn).not.toBeNull();

    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);
    rerender({ ...baseParams, dataOptions: { __rerender: 1 } as never });

    mockExecute.mockClear();
    act(() => {
      latestOnDownloadExcel.fn?.(false);
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('adds Excel menu and calls loader execute with mergeRows false for repeat rows', () => {
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [{ id: 'r1' } as never],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);

    const { result } = renderHook(() => usePivotWidgetExcelDownload(baseParams));

    const onClick = findExcelRepeatRowsOnClick(result.current.headerConfig);
    expect(onClick).toBeDefined();

    act(() => {
      onClick?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: [{ name: 'attr', col: { id: 'r1' }, panel: 'rows' }],
        measures: [],
        mergeRows: false,
        filename: 'Pivot.xlsx',
        widgetType: 'pivot',
      }),
    );
  });

  it('calls loader execute with mergeRows true for merge rows', () => {
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [{ id: 'r1' } as never],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);

    const { result } = renderHook(() => usePivotWidgetExcelDownload(baseParams));

    const onClick = findExcelMergeRowsOnClick(result.current.headerConfig);
    expect(onClick).toBeDefined();

    act(() => {
      onClick?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({ mergeRows: true }));
  });

  it('passes filters to loader execute on download', () => {
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [{ id: 'r1' } as never],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);

    const filters = [filterFactory.members(DM.Commerce.Gender, ['Male'])];

    const { result } = renderHook(() => usePivotWidgetExcelDownload({ ...baseParams, filters }));

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
