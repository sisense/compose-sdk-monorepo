import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCsvQueryFileLoader } from './use-csv-query-file-loader.js';

const csvQueryState = vi.hoisted(() => ({
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

vi.mock('@/domains/query-execution/hooks/use-execute-csv-query/use-execute-csv-query.js', () => ({
  useExecuteCsvQueryInternal: () => csvQueryState.current,
}));

describe('useCsvQueryFileLoader', () => {
  let lastAnchor: HTMLAnchorElement | null;
  let lastAnchorClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    lastAnchor = null;
    lastAnchorClick = vi.fn();
    csvQueryState.current = { isSuccess: false, isError: false, data: undefined };
    urlDownloadMocks.createObjectURL.mockClear();
    urlDownloadMocks.revokeObjectURL.mockClear();
    // jsdom's URL often omits blob helpers; install mocks for downloadBlobAsFile.
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

  it('on success triggers download with normalized filename and clears pending state', async () => {
    const { result, rerender } = renderHook(() => useCsvQueryFileLoader());
    const blob = new Blob(['a,b'], { type: 'text/csv' });

    act(() => {
      result.current.execute({ dimensions: [], measures: [], filename: 'My Report.csv' });
    });

    csvQueryState.current = { isSuccess: true, isError: false, data: blob };
    await act(async () => {
      rerender();
    });

    expect(urlDownloadMocks.createObjectURL).toHaveBeenCalledWith(blob);
    expect(lastAnchor?.download).toBe('MyReport.csv');
    expect(lastAnchorClick).toHaveBeenCalled();

    csvQueryState.current = { isSuccess: false, isError: false, data: undefined };
    await act(async () => {
      rerender();
    });

    act(() => {
      result.current.execute({ dimensions: [], measures: [] });
    });
    csvQueryState.current = { isSuccess: true, isError: false, data: blob };
    await act(async () => {
      rerender();
    });
    expect(urlDownloadMocks.createObjectURL).toHaveBeenCalledTimes(2);
  });

  it('on error clears pending state without downloading', async () => {
    const { result, rerender } = renderHook(() => useCsvQueryFileLoader());

    act(() => {
      result.current.execute({ dimensions: [], measures: [] });
    });

    const callsAfterExecute = urlDownloadMocks.createObjectURL.mock.calls.length;

    csvQueryState.current = { isSuccess: false, isError: true, data: undefined };
    await act(async () => {
      rerender();
    });

    expect(urlDownloadMocks.createObjectURL).toHaveBeenCalledTimes(callsAfterExecute);
  });
});
