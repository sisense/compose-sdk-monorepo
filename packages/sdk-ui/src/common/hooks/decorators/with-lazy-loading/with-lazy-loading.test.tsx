import { act } from 'react';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook as originalRenderHook, waitFor } from '@testing-library/react';

import { SliceableRestApiHook } from './types';
import { withLazyLoading } from './with-lazy-loading';

const allAvailableNumbers = [1, 2, 3, 4, 5, 6];

const getNumbersFromApi = vi.fn(
  async (slice: { count: number; offset: number }, multiplier: number): Promise<number[]> => {
    return allAvailableNumbers
      .slice(slice.offset, slice.offset + slice.count)
      .map((n) => n * (multiplier || 1));
  },
);

/**
 * Decorated `renderHook` from '@testing-library/react'
 * with a `QueryClientProvider` wrapper to be able to run `useQuery` hook inside.
 */
const renderHook: typeof originalRenderHook = (hook, options) => {
  const Wrapper = options?.wrapper || (({ children }) => <>{children}</>);
  return originalRenderHook(hook, {
    ...options,
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <Wrapper>{children}</Wrapper>
      </QueryClientProvider>
    ),
  });
};

/**
 * A mock API that returns a slice of the available numbers.
 * The slice is defined by the `count` and `offset` parameters.
 * The `multiplier` parameter is used to multiply each number in the slice.
 */
const useGetNumbersFromApi: SliceableRestApiHook<
  { multiplier?: number; count: number; offset: number },
  'numbers',
  number[]
> = (params) => {
  const { count, offset, multiplier = 1 } = params;

  const queryState = useQuery({
    queryKey: ['numbers', count, offset, multiplier],
    queryFn: () => getNumbersFromApi({ count, offset }, multiplier),
  });
  switch (queryState.status) {
    case 'success':
      return {
        numbers: queryState.data,
        isLoading: false,
        isError: false,
        isSuccess: true,
        error: undefined,
        status: 'success',
      };
    case 'loading':
      return {
        numbers: queryState.data,
        isLoading: true,
        isError: false,
        isSuccess: false,
        error: undefined,
        status: 'loading',
      };
    case 'error':
      return {
        numbers: undefined,
        isLoading: false,
        isError: true,
        isSuccess: false,
        error: queryState.error as Error,
        status: 'error',
      };
  }
};

describe('withLazyLoading', () => {
  /** Lazy loading hook to test */
  const useLazyGetNumbersFromApi = withLazyLoading({
    initialCount: 3,
    chunkSize: 2,
    dataKey: 'numbers',
  })(useGetNumbersFromApi);

  it('should return initial data', async () => {
    const { result } = renderHook(() => useLazyGetNumbersFromApi({}));
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3]);
      expect(getNumbersFromApi).toHaveBeenCalledOnce();
    });
  });

  it('should load more data', async () => {
    const { result } = renderHook(() => useLazyGetNumbersFromApi({}));
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3]);
    });
    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3, 4, 5]);
    });
    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3, 4, 5, 6]);
    });
    // still the same as all available numbers are loaded
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  it('should recalculate data when multiplier changes', async () => {
    const { result, rerender } = renderHook(
      ({ multiplier }) => useLazyGetNumbersFromApi({ multiplier }),
      { initialProps: { multiplier: 1 } },
    );
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3]);
    });
    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3, 4, 5]);
    });
    // switch to multiplier 2
    rerender({ multiplier: 2 });
    await waitFor(() => {
      expect(result.current.numbers).toEqual([2, 4, 6]);
    });
    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => {
      expect(result.current.numbers).toEqual([2, 4, 6, 8, 10]);
    });
    // switch back to multiplier 1
    rerender({ multiplier: 1 });
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3]);
    });
    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => {
      expect(result.current.numbers).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
