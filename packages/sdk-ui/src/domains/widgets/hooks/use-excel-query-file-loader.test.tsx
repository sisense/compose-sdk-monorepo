import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useExcelQueryFileLoader } from './use-excel-query-file-loader.js';

const excelQueryState = vi.hoisted(() => ({
  current: {
    isSuccess: false,
    isError: false,
    data: undefined as Blob | undefined,
  },
}));

const urlDownloadMocks = vi.hoisted(() => ({
  createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
  revokeObjectURL: vi.fn(),
}));

vi.mock(
  '@/domains/query-execution/hooks/use-execute-excel-query/use-execute-excel-query.js',
  () => ({
    useExecuteExcelQueryInternal: () => excelQueryState.current,
  }),
);

describe('useExcelQueryFileLoader', () => {
  let lastAnchor: HTMLAnchorElement | null;
  let lastAnchorClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    lastAnchor = null;
    lastAnchorClick = vi.fn();
    excelQueryState.current = { isSuccess: false, isError: false, data: undefined };
    urlDownloadMocks.createObjectURL.mockClear();
    urlDownloadMocks.revokeObjectURL.mockClear();
    vi.stubGlobal(
      'URL',
      class PatchedURL extends URL {
        static createObjectURL = urlDownloadMocks.createObjectURL;

        static revokeObjectURL = urlDownloadMocks.revokeObjectURL;
      } as typeof URL,
    );
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: unknown) => {
      if (tag === 'a') {
        const el = originalCreate('a', options as never);
        el.click = lastAnchorClick;
        lastAnchor = el;
        return el;
      }
      return originalCreate(tag, options as never);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('on success triggers download with normalized filename and clears pending state', () => {
    const { result, rerender } = renderHook(() => useExcelQueryFileLoader());
    const blob = new Blob(['x'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    act(() => {
      result.current.execute({
        dimensions: [],
        measures: [],
        mergeRows: false,
        filename: 'My Report.xlsx',
      });
    });

    excelQueryState.current = { isSuccess: true, isError: false, data: blob };
    act(() => {
      rerender();
    });

    expect(urlDownloadMocks.createObjectURL).toHaveBeenCalledWith(blob);
    expect(lastAnchor?.download).toBe('MyReport.xlsx');
    expect(lastAnchorClick).toHaveBeenCalled();
  });

  it('on error clears pending state without downloading', () => {
    const { result, rerender } = renderHook(() => useExcelQueryFileLoader());

    act(() => {
      result.current.execute({ dimensions: [], measures: [], mergeRows: false });
    });

    const callsAfterExecute = urlDownloadMocks.createObjectURL.mock.calls.length;

    excelQueryState.current = { isSuccess: false, isError: true, data: undefined };
    act(() => {
      rerender();
    });

    expect(urlDownloadMocks.createObjectURL).toHaveBeenCalledTimes(callsAfterExecute);
  });

  it('triggers a second download when execute is called again with the same mergeRows', () => {
    const { result, rerender } = renderHook(() => useExcelQueryFileLoader());
    const blob1 = new Blob(['a'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const blob2 = new Blob(['b'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    act(() => {
      result.current.execute({
        dimensions: [],
        measures: [],
        mergeRows: false,
        filename: 'R1.xlsx',
      });
    });

    excelQueryState.current = { isSuccess: true, isError: false, data: blob1 };
    act(() => {
      rerender();
    });
    expect(urlDownloadMocks.createObjectURL).toHaveBeenCalledWith(blob1);

    excelQueryState.current = { isSuccess: false, isError: false, data: undefined };
    act(() => {
      rerender();
    });

    act(() => {
      result.current.execute({
        dimensions: [],
        measures: [],
        mergeRows: false,
        filename: 'R2.xlsx',
      });
    });

    excelQueryState.current = { isSuccess: true, isError: false, data: blob2 };
    act(() => {
      rerender();
    });

    expect(urlDownloadMocks.createObjectURL).toHaveBeenLastCalledWith(blob2);
  });

  it('triggers a second download when switching mergeRows between successive executes', () => {
    const { result, rerender } = renderHook(() => useExcelQueryFileLoader());
    const blobRepeat = new Blob(['r'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const blobMerge = new Blob(['m'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    act(() => {
      result.current.execute({
        dimensions: [],
        measures: [],
        mergeRows: false,
        filename: 'Repeat.xlsx',
      });
    });

    excelQueryState.current = { isSuccess: true, isError: false, data: blobRepeat };
    act(() => {
      rerender();
    });
    expect(urlDownloadMocks.createObjectURL).toHaveBeenCalledWith(blobRepeat);

    excelQueryState.current = { isSuccess: false, isError: false, data: undefined };
    act(() => {
      rerender();
    });

    act(() => {
      result.current.execute({
        dimensions: [],
        measures: [],
        mergeRows: true,
        filename: 'Merge.xlsx',
      });
    });

    excelQueryState.current = { isSuccess: true, isError: false, data: blobMerge };
    act(() => {
      rerender();
    });

    expect(urlDownloadMocks.createObjectURL).toHaveBeenLastCalledWith(blobMerge);
  });
});
