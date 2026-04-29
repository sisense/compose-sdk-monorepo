/** @vitest-environment jsdom */

/* eslint-disable @typescript-eslint/unbound-method */
import { HookAdapter } from '@sisense/sdk-ui-preact';
import { of } from 'rxjs';

import { DataSourceService, GetDataSourceDimensionsParams } from './data-source.service';
import { SisenseContextService } from './sisense-context.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@sisense/sdk-ui-preact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    useGetDataSourceDimensionsInternal: vi.fn(),
    HookAdapter: vi.fn().mockImplementation(() => ({
      subscribe: vi.fn(),
      run: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

const MockHookAdapter = vi.mocked(HookAdapter);

describe('DataSourceService', () => {
  let dataSourceService: DataSourceService;
  let sisenseContextServiceMock: Partial<SisenseContextService>;

  beforeEach(() => {
    vi.clearAllMocks();

    sisenseContextServiceMock = {
      getApp: vi.fn().mockResolvedValue({}),
      getApp$: vi.fn().mockReturnValue(of({ app: {} })),
      getConfig: vi.fn().mockReturnValue({
        showRuntimeErrors: false,
        appConfig: {
          trackingConfig: {
            enabled: true,
          },
        },
      }),
    };

    dataSourceService = new DataSourceService(sisenseContextServiceMock as SisenseContextService);
  });

  it('should be created', () => {
    expect(dataSourceService).toBeTruthy();
  });

  describe('getDataSourceDimensions', () => {
    it('should retrieve data source dimensions successfully', async () => {
      const mockDimensions = [
        { name: 'Category', expression: '[Category.Category]' },
        { name: 'Country', expression: '[Country.Country]' },
      ];

      const mockResult = {
        isSuccess: true,
        isLoading: false,
        isError: false,
        error: undefined,
        dimensions: mockDimensions,
        status: 'success' as const,
      };

      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetDataSourceDimensionsParams = {
        dataSource: 'Sample ECommerce',
      };

      const result = await dataSourceService.getDataSourceDimensions(params);

      expect(result.dimensions).toHaveLength(2);
      expect(result.dimensions[0].name).toBe('Category');
    });

    it('should handle errors correctly', async () => {
      const mockError = new Error('Data source not found');
      const mockResult = {
        isSuccess: false,
        isLoading: false,
        isError: true,
        error: mockError,
        dimensions: undefined,
        status: 'error' as const,
      };

      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetDataSourceDimensionsParams = {
        dataSource: 'NonExistent',
      };

      await expect(dataSourceService.getDataSourceDimensions(params)).rejects.toThrow(
        'Data source not found',
      );
    });

    it('should pass correct parameters to the hook', async () => {
      const mockDimensions = [{ name: 'Category', expression: '[Category.Category]' }];

      const mockResult = {
        isSuccess: true,
        isLoading: false,
        isError: false,
        error: undefined,
        dimensions: mockDimensions,
        status: 'success' as const,
      };

      let capturedParams: unknown;
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

      const params: GetDataSourceDimensionsParams = {
        dataSource: 'Sample ECommerce',
        count: 50,
        offset: 0,
      };

      await dataSourceService.getDataSourceDimensions(params);

      expect(capturedParams).toMatchObject({
        dataSource: 'Sample ECommerce',
        count: 50,
        offset: 0,
      });
    });
  });
});
