/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClientApplication } from '@/infra/app/types.js';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context.js';

import type { ExecuteExcelQueryParams } from '../../types.js';
import { useExecuteExcelQueryInternal } from './use-execute-excel-query.js';

const exportJaqlToXlsx = vi.hoisted(() =>
  vi.fn().mockResolvedValue(
    new Blob(['x'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  ),
);

const buildJaqlForExcelExport = vi.hoisted(() => vi.fn(() => ({ jaql: {} })));

vi.mock('@/infra/api/rest-api.js', () => ({
  RestApi: vi.fn().mockImplementation(() => ({
    exportJaqlToXlsx,
  })),
}));

vi.mock('./excel-export/build-jaql-excel-export.js', () => ({
  buildJaqlForExcelExport,
}));

vi.mock('./excel-export/build-xlsx-export-payload.js', () => ({
  buildXlsxExportPayload: vi.fn(() => ({})),
}));

vi.mock('@/infra/contexts/sisense-context/sisense-context.js', () => ({
  useSisenseContext: useSisenseContextMock,
}));

const xlsxBlob = new Blob(['x'], {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

const baseParams: ExecuteExcelQueryParams = {
  dimensions: [],
  measures: [],
  mergeRows: false,
  enabled: false,
  widgetType: 'column',
  widgetId: 'widget-1',
  widgetTitle: 'T',
  dataSource: { title: 'DS' } as ExecuteExcelQueryParams['dataSource'],
};

describe('useExecuteExcelQueryInternal', () => {
  beforeEach(() => {
    exportJaqlToXlsx.mockClear();
    exportJaqlToXlsx.mockResolvedValue(xlsxBlob);
    buildJaqlForExcelExport.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {
        httpClient: {},
        defaultDataSource: { title: 'DS' },
        settings: { translationConfig: { language: 'en-US' } },
      } as ClientApplication,
      isInitialized: true,
    });
  });

  it('does not call export while disabled', () => {
    renderHook(() => useExecuteExcelQueryInternal({ ...baseParams, enabled: false }));
    expect(exportJaqlToXlsx).not.toHaveBeenCalled();
  });

  it('calls export when enabled and reaches success', async () => {
    /** Same object identity across renders (as with `useMemo` in {@link useExcelQueryFileLoader}). */
    const props: ExecuteExcelQueryParams = {
      ...baseParams,
      enabled: true,
      exportRunId: 1,
    };
    const { result } = renderHook(() => useExecuteExcelQueryInternal(props));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(xlsxBlob);
    });
    expect(exportJaqlToXlsx).toHaveBeenCalledTimes(1);
  });

  it('calls export again after idle and a new exportRunId with the same mergeRows (on-demand)', async () => {
    const { rerender } = renderHook(
      (p: ExecuteExcelQueryParams) => useExecuteExcelQueryInternal(p),
      {
        initialProps: {
          ...baseParams,
          enabled: true,
          mergeRows: false,
          exportRunId: 1,
        },
      },
    );

    await waitFor(() => expect(exportJaqlToXlsx).toHaveBeenCalledTimes(1));

    rerender({ ...baseParams, enabled: false, mergeRows: false, exportRunId: 1 });
    rerender({
      ...baseParams,
      enabled: true,
      mergeRows: false,
      exportRunId: 2,
    });

    await waitFor(() => expect(exportJaqlToXlsx).toHaveBeenCalledTimes(2));
  });

  it('calls export again when only mergeRows changes between runs', async () => {
    const { rerender } = renderHook(
      (p: ExecuteExcelQueryParams) => useExecuteExcelQueryInternal(p),
      {
        initialProps: {
          ...baseParams,
          enabled: true,
          mergeRows: false,
          exportRunId: 1,
        },
      },
    );

    await waitFor(() => expect(exportJaqlToXlsx).toHaveBeenCalledTimes(1));

    rerender({ ...baseParams, enabled: false, mergeRows: false, exportRunId: 1 });
    rerender({
      ...baseParams,
      enabled: true,
      mergeRows: true,
      exportRunId: 2,
    });

    await waitFor(() => expect(exportJaqlToXlsx).toHaveBeenCalledTimes(2));
  });

  it('passes filters to buildJaqlForExcelExport', async () => {
    const filters = [{ id: 'filter-1' }] as ExecuteExcelQueryParams['filters'];
    const props: ExecuteExcelQueryParams = {
      ...baseParams,
      enabled: true,
      exportRunId: 1,
      filters,
    };

    renderHook(() => useExecuteExcelQueryInternal(props));

    await waitFor(() => expect(buildJaqlForExcelExport).toHaveBeenCalledTimes(1));
    expect(buildJaqlForExcelExport).toHaveBeenCalledWith(
      expect.objectContaining({ filters }),
      expect.objectContaining({
        widgetOid: 'widget-1',
        widgetTitle: 'T',
        mergeRows: false,
      }),
    );
  });
});
