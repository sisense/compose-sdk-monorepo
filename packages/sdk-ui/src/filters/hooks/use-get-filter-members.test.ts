/* eslint-disable vitest/no-conditional-expect */
import { renderHook, waitFor } from '@testing-library/react';
import { GetFilterMembersData, useGetFilterMembers } from './use-get-filter-members';
import { translation } from '../../translation/resources/en.js';
import { useSisenseContextMock } from '../../sisense-context/__mocks__/sisense-context.js';
import { ClientApplication } from '../../app/client-application.js';
import { QueryResultData, filterFactory } from '@sisense/sdk-data';
import * as DM from '../../__test-helpers__/sample-ecommerce';
import { executeQueryMock } from '../../query/__mocks__/execute-query';

vi.mock('../../query/execute-query');
vi.mock('../../sisense-context/sisense-context');

vi.mock('@sisense/sdk-tracking', async () => {
  const actual: typeof import('@sisense/sdk-tracking') = await vi.importActual(
    '@sisense/sdk-tracking',
  );
  return {
    ...actual,
    trackProductEvent: vi.fn().mockImplementation(() => {
      console.log('trackProductEvent');
      return Promise.resolve();
    }),
  };
});

describe('useGetFilterMembers', () => {
  const defaultEmptyData: GetFilterMembersData = {
    selectedMembers: [],
    allMembers: [],
    excludeMembers: false,
    enableMultiSelection: true,
    hasBackgroundFilter: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSisenseContextMock.mockReturnValue({
      app: {
        httpClient: {},
        settings: {
          queryLimit: 20000,
          queryCacheConfig: { enabled: false },
        },
      } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
      },
    });
  });

  it('should throw an error if filter is not a Members Filter', () => {
    try {
      renderHook(() => {
        useGetFilterMembers({ filter: filterFactory.greaterThan(DM.Commerce.Quantity, 1000) });
        // should never get here
        expect(false).toBeNull();
      });
    } catch (err) {
      expect((err as Error).message).toBe(translation.errors.notAMembersFilter);
    }
  });

  it('should have correct initial loading state', () => {
    const mockPromise = new Promise(() => {}); // Never resolving promise
    executeQueryMock.mockReturnValue(mockPromise);

    const { result } = renderHook(() =>
      useGetFilterMembers({
        filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
      }),
    );

    // Check all loading state properties
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toEqual(defaultEmptyData);
    expect(typeof result.current.loadMore).toBe('function');
  });

  it('should maintain loading state until query completes', async () => {
    let resolveQuery: (value: QueryResultData) => void;
    const mockPromise = new Promise<QueryResultData>((resolve) => {
      resolveQuery = resolve;
    });
    executeQueryMock.mockReturnValue(mockPromise);

    const { result } = renderHook(() =>
      useGetFilterMembers({
        filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
      }),
    );

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);
    expect(result.current.status).toBe('loading');

    // Resolve the promise
    const mockData: QueryResultData = {
      columns: [{ name: 'AgeRange', type: 'string' }],
      rows: [[{ data: '0-18' }], [{ data: '19-24' }], [{ data: '25-34' }]],
    };
    resolveQuery!(mockData);

    // Wait for state to update
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.status).toBe('success');
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle loading state with disabled hook', () => {
    const { result } = renderHook(() =>
      useGetFilterMembers({
        filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
        enabled: false,
      }),
    );

    // When disabled, the hook should remain in initial loading state and never execute
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.status).toBe('loading');
    expect(result.current.data).toEqual(defaultEmptyData);
    expect(result.current.error).toBeUndefined();
  });

  it('should transition from loading to success state', async () => {
    const mockData: QueryResultData = {
      columns: [{ name: 'AgeRange', type: 'string' }],
      rows: [[{ data: '0-18' }], [{ data: '19-24' }], [{ data: '25-34' }]],
    };
    executeQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useGetFilterMembers({
        filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
      }),
    );

    // Initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.status).toBe('loading');

    // Wait for transition to success
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.status).toBe('success');
      expect(result.current.data).toBeDefined();
    });
  });

  it('should work with Members Filter', async () => {
    const mockData: QueryResultData = {
      columns: [{ name: 'AgeRange', type: 'string' }],
      rows: [
        [{ data: '0-18' }],
        [{ data: '19-24' }],
        [{ data: '25-34' }],
        [{ data: '35-44' }],
        [{ data: '45-54' }],
      ],
    };
    executeQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useGetFilterMembers({
        filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);

      expect(result.current.data).toStrictEqual({
        selectedMembers: [
          { key: '19-24', title: '19-24', inactive: false },
          { key: '25-34', title: '25-34', inactive: false },
        ],
        allMembers: [
          { key: '0-18', title: '0-18' },
          { key: '19-24', title: '19-24' },
          { key: '25-34', title: '25-34' },
          { key: '35-44', title: '35-44' },
          { key: '45-54', title: '45-54' },
        ],
        excludeMembers: false,
        enableMultiSelection: true,
        hasBackgroundFilter: false,
      });
    });
  });
});
