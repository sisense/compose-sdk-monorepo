/** @vitest-environment jsdom */

/* eslint-disable @typescript-eslint/unbound-method */
import { DimensionalAttribute, filterFactory } from '@sisense/sdk-data';
import { HookAdapter } from '@sisense/sdk-ui-preact';

import { FilterService, GetFilterMembersParams } from './filter.service';
import { SisenseContextService } from './sisense-context.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@sisense/sdk-ui-preact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    useGetFilterMembers: vi.fn(),
    HookAdapter: vi.fn().mockImplementation(() => ({
      subscribe: vi.fn(),
      run: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

const MockHookAdapter = vi.mocked(HookAdapter);

// Mock attribute for testing
const mockAttribute = new DimensionalAttribute('Country', '[Country.Country]', 'text-attribute');

describe('FilterService', () => {
  let filterService: FilterService;
  let sisenseContextServiceMock: Partial<SisenseContextService>;

  beforeEach(() => {
    vi.clearAllMocks();

    sisenseContextServiceMock = {
      getApp: vi.fn().mockResolvedValue({}),
      getConfig: vi.fn().mockReturnValue({
        showRuntimeErrors: false,
        appConfig: {
          trackingConfig: {
            enabled: true,
          },
        },
      }),
    };

    filterService = new FilterService(sisenseContextServiceMock as SisenseContextService);
  });

  it('should be created', () => {
    expect(filterService).toBeTruthy();
  });

  describe('getFilterMembers', () => {
    it('should retrieve filter members successfully', async () => {
      const mockData = {
        selectedMembers: [
          { key: 'USA', title: 'United States', inactive: false },
          { key: 'CAN', title: 'Canada', inactive: false },
        ],
        allMembers: [
          { key: 'USA', title: 'United States' },
          { key: 'CAN', title: 'Canada' },
          { key: 'MEX', title: 'Mexico' },
        ],
        excludeMembers: false,
        enableMultiSelection: true,
        hasBackgroundFilter: false,
      };

      const mockResult = {
        isSuccess: true,
        isLoading: false,
        isError: false,
        error: undefined,
        data: mockData,
        loadMore: vi.fn(),
      };

      // Mock HookAdapter behavior
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              // Simulate immediate callback with result
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetFilterMembersParams = {
        filter: filterFactory.members(mockAttribute, ['USA', 'CAN']),
      };

      const result = await filterService.getFilterMembers(params);

      expect(result.selectedMembers).toHaveLength(2);
      expect(result.allMembers).toHaveLength(3);
      expect(result.excludeMembers).toBe(false);
      expect(result.enableMultiSelection).toBe(true);
    });

    it('should handle errors correctly', async () => {
      const mockError = new Error('Query failed');
      const mockResult = {
        isSuccess: false,
        isLoading: false,
        isError: true,
        error: mockError,
        data: undefined,
        loadMore: vi.fn(),
      };

      // Mock HookAdapter behavior for error case
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              // Simulate immediate callback with error
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetFilterMembersParams = {
        filter: filterFactory.members(mockAttribute, ['USA', 'CAN']),
      };

      await expect(filterService.getFilterMembers(params)).rejects.toThrow('Query failed');
    });

    it('should pass correct parameters to the hook', async () => {
      const mockData = {
        selectedMembers: [],
        allMembers: [],
        excludeMembers: false,
        enableMultiSelection: true,
        hasBackgroundFilter: false,
      };

      const mockResult = {
        isSuccess: true,
        isLoading: false,
        isError: false,
        error: undefined,
        data: mockData,
        loadMore: vi.fn(),
      };

      let capturedParams: any;
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn((params) => {
              capturedParams = params;
            }),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetFilterMembersParams = {
        filter: filterFactory.members(mockAttribute, ['USA']),
        count: 100,
        parentFilters: [],
      };

      await filterService.getFilterMembers(params);

      expect(capturedParams).toMatchObject({
        filter: params.filter,
        count: 100,
        parentFilters: [],
      });
    });
  });
});
