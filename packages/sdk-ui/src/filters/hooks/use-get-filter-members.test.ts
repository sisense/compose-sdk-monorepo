/* eslint-disable vitest/no-conditional-expect */
import { filterFactory, QueryResultData } from '@sisense/sdk-data';
import { renderHook, waitFor } from '@testing-library/react';

import * as DM from '../../__test-helpers__/sample-ecommerce';
import { ClientApplication } from '../../app/client-application.js';
import { executeQueryMock } from '../../query/__mocks__/execute-query';
import { useSisenseContextMock } from '../../sisense-context/__mocks__/sisense-context.js';
import { translation } from '../../translation/resources/en.js';
import { GetFilterMembersData, useGetFilterMembers } from './use-get-filter-members';

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

  describe('allowMissingMembers configuration', () => {
    it('should not include missing filter members when allowMissingMembers is false (default)', async () => {
      const mockData: QueryResultData = {
        columns: [{ name: 'AgeRange', type: 'string' }],
        rows: [
          [{ data: '0-18' }],
          [{ data: '19-24' }],
          // '25-34' is missing from query results
          [{ data: '35-44' }],
        ],
      };
      executeQueryMock.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useGetFilterMembers({
          filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
          allowMissingMembers: false,
        }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });

      // '25-34' should not be in selectedMembers as it's not in query results
      expect(result.current.data?.selectedMembers).toStrictEqual([
        { key: '19-24', title: '19-24', inactive: false },
      ]);

      // '25-34' should not be in allMembers as it's not in query results
      expect(result.current.data?.allMembers).toStrictEqual([
        { key: '0-18', title: '0-18' },
        { key: '19-24', title: '19-24' },
        { key: '35-44', title: '35-44' },
      ]);
    });

    it('should include missing filter members when allowMissingMembers is true', async () => {
      const mockData: QueryResultData = {
        columns: [{ name: 'AgeRange', type: 'string' }],
        rows: [
          [{ data: '0-18' }],
          [{ data: '19-24' }],
          // '25-34' is missing from query results
          [{ data: '35-44' }],
        ],
      };
      executeQueryMock.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useGetFilterMembers({
          filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
          allowMissingMembers: true,
        }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });

      // '25-34' should be in selectedMembers even though it's not in query results
      // Missing members appear first, then queried members
      expect(result.current.data?.selectedMembers).toStrictEqual([
        { key: '25-34', title: '25-34', inactive: false },
        { key: '19-24', title: '19-24', inactive: false },
      ]);

      // '25-34' should be in allMembers at the beginning (missing members come first)
      expect(result.current.data?.allMembers).toStrictEqual([
        { key: '25-34', title: '25-34' },
        { key: '0-18', title: '0-18' },
        { key: '19-24', title: '19-24' },
        { key: '35-44', title: '35-44' },
      ]);
    });

    it('should include missing deactivated members when allowMissingMembers is true', async () => {
      const mockData: QueryResultData = {
        columns: [{ name: 'AgeRange', type: 'string' }],
        rows: [
          [{ data: '0-18' }],
          [{ data: '19-24' }],
          // '25-34' and '35-44' are missing from query results
        ],
      };
      executeQueryMock.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useGetFilterMembers({
          filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24'], {
            deactivatedMembers: ['25-34', '35-44'],
          }),
          allowMissingMembers: true,
        }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });

      // Both active and deactivated missing members should be in selectedMembers
      // Missing deactivated members appear first, then queried active members
      expect(result.current.data?.selectedMembers).toStrictEqual([
        { key: '25-34', title: '25-34', inactive: true },
        { key: '35-44', title: '35-44', inactive: true },
        { key: '19-24', title: '19-24', inactive: false },
      ]);

      // Missing deactivated members should be in allMembers
      expect(result.current.data?.allMembers).toStrictEqual([
        { key: '25-34', title: '25-34' },
        { key: '35-44', title: '35-44' },
        { key: '0-18', title: '0-18' },
        { key: '19-24', title: '19-24' },
      ]);
    });

    it('should not duplicate members when missing members are later found in query results', async () => {
      const mockData: QueryResultData = {
        columns: [{ name: 'AgeRange', type: 'string' }],
        rows: [
          [{ data: '0-18' }],
          [{ data: '19-24' }],
          [{ data: '25-34' }], // This member is both in filter and query results
          [{ data: '35-44' }],
        ],
      };
      executeQueryMock.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useGetFilterMembers({
          filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
          allowMissingMembers: true,
        }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });

      // Members should not be duplicated
      expect(result.current.data?.selectedMembers).toStrictEqual([
        { key: '19-24', title: '19-24', inactive: false },
        { key: '25-34', title: '25-34', inactive: false },
      ]);

      // allMembers should not have duplicates
      expect(result.current.data?.allMembers).toStrictEqual([
        { key: '0-18', title: '0-18' },
        { key: '19-24', title: '19-24' },
        { key: '25-34', title: '25-34' },
        { key: '35-44', title: '35-44' },
      ]);
    });

    it('should handle multiple missing members with mixed active and inactive states', async () => {
      const mockData: QueryResultData = {
        columns: [{ name: 'AgeRange', type: 'string' }],
        rows: [
          [{ data: '0-18' }],
          // '19-24', '25-34', '35-44', '45-54' are all missing
          [{ data: '55-64' }],
        ],
      };
      executeQueryMock.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useGetFilterMembers({
          filter: filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34'], {
            deactivatedMembers: ['35-44', '45-54'],
          }),
          allowMissingMembers: true,
        }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });

      // All missing members (both active and inactive) should be in selectedMembers
      expect(result.current.data?.selectedMembers).toStrictEqual([
        { key: '19-24', title: '19-24', inactive: false },
        { key: '25-34', title: '25-34', inactive: false },
        { key: '35-44', title: '35-44', inactive: true },
        { key: '45-54', title: '45-54', inactive: true },
      ]);

      // All missing members should appear first in allMembers, followed by queried members
      expect(result.current.data?.allMembers).toStrictEqual([
        { key: '19-24', title: '19-24' },
        { key: '25-34', title: '25-34' },
        { key: '35-44', title: '35-44' },
        { key: '45-54', title: '45-54' },
        { key: '0-18', title: '0-18' },
        { key: '55-64', title: '55-64' },
      ]);
    });
  });
});
