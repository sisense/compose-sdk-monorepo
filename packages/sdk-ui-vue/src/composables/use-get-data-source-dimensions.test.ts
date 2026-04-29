/** @vitest-environment jsdom */
import {
  type DataSourceDimensionsState,
  HookAdapter,
  useGetDataSourceDimensionsInternal,
} from '@sisense/sdk-ui-preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useGetDataSourceDimensions } from './use-get-data-source-dimensions';

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

vi.mock('../helpers/context-connectors', () => ({
  createSisenseContextConnector: vi.fn(() => ({
    propsObserver: {
      setValue: vi.fn(),
    },
    providerComponent: vi.fn(),
  })),
}));

vi.mock('./use-tracking', () => ({
  useTracking: vi.fn(() => ({ hasTrackedRef: ref(false) })),
}));

const onBeforeUnmountCallbacks: Array<() => void> = [];
vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue')>();
  return {
    ...actual,
    onBeforeUnmount: vi.fn((callback: () => void) => {
      onBeforeUnmountCallbacks.push(callback);
    }),
  };
});

const MockHookAdapter = vi.mocked(HookAdapter);

describe('useGetDataSourceDimensions', () => {
  let mockSubscribe: ReturnType<typeof vi.fn>;
  let mockRun: ReturnType<typeof vi.fn>;
  let mockDestroy: ReturnType<typeof vi.fn>;
  let subscribeCallback: ((result: DataSourceDimensionsState) => void) | null;

  beforeEach(() => {
    vi.clearAllMocks();
    onBeforeUnmountCallbacks.length = 0;
    subscribeCallback = null;

    mockSubscribe = vi.fn((callback: (result: DataSourceDimensionsState) => void) => {
      subscribeCallback = callback;
      return { unsubscribe: vi.fn() };
    });
    mockRun = vi.fn();
    mockDestroy = vi.fn();

    MockHookAdapter.mockImplementation(
      () =>
        ({
          subscribe: mockSubscribe,
          run: mockRun,
          destroy: mockDestroy,
        } as any),
    );
  });

  afterEach(() => {
    subscribeCallback = null;
  });

  it('should create HookAdapter with useGetDataSourceDimensionsInternal', () => {
    const params = { dataSource: 'Sample ECommerce' };
    useGetDataSourceDimensions(params);

    expect(MockHookAdapter).toHaveBeenCalledWith(
      useGetDataSourceDimensionsInternal,
      expect.any(Array),
    );
    expect(MockHookAdapter).toHaveBeenCalledTimes(1);
  });

  it('should return reactive state with initial loading state', () => {
    const params = { dataSource: 'Sample ECommerce' };
    const result = useGetDataSourceDimensions(params);

    expect(result.isLoading.value).toBe(true);
    expect(result.isError.value).toBe(false);
    expect(result.isSuccess.value).toBe(false);
    expect(result.status.value).toBe('loading');
    expect(result.dimensions.value).toBeUndefined();
    expect(result.error.value).toBeUndefined();
  });

  it('should update state when hook emits success result', async () => {
    const mockDimensions = [{ name: 'Category', expression: '[Category.Category]' }] as any[];

    const mockResult: DataSourceDimensionsState = {
      isSuccess: true,
      isLoading: false,
      isError: false,
      error: undefined,
      dimensions: mockDimensions,
      status: 'success',
    };

    const params = { dataSource: 'Sample ECommerce' };
    const result = useGetDataSourceDimensions(params);

    if (subscribeCallback) {
      subscribeCallback(mockResult);
    }

    await nextTick();

    expect(result.isLoading.value).toBe(false);
    expect(result.isError.value).toBe(false);
    expect(result.isSuccess.value).toBe(true);
    expect(result.status.value).toBe('success');
    expect(result.dimensions.value).toEqual(mockDimensions);
    expect(result.error.value).toBeUndefined();
  });

  it('should update state when hook emits error result', async () => {
    const mockError = new Error('Data source not found');
    const mockResult: DataSourceDimensionsState = {
      isSuccess: false,
      isLoading: false,
      isError: true,
      error: mockError,
      dimensions: undefined,
      status: 'error',
    };

    const params = { dataSource: 'NonExistent' };
    const result = useGetDataSourceDimensions(params);

    if (subscribeCallback) {
      subscribeCallback(mockResult);
    }

    await nextTick();

    expect(result.isLoading.value).toBe(false);
    expect(result.isError.value).toBe(true);
    expect(result.isSuccess.value).toBe(false);
    expect(result.status.value).toBe('error');
    expect(result.error.value).toEqual(mockError);
    expect(result.dimensions.value).toBeUndefined();
  });

  it('should support reactive parameters with refs', async () => {
    const dataSourceRef = ref('Sample ECommerce');
    const params = { dataSource: dataSourceRef };
    useGetDataSourceDimensions(params);

    expect(mockRun).toHaveBeenCalledWith({ dataSource: 'Sample ECommerce' });
    expect(mockRun).toHaveBeenCalledTimes(1);

    dataSourceRef.value = 'Another DataSource';
    await nextTick();

    expect(mockRun).toHaveBeenCalledWith({ dataSource: 'Another DataSource' });
    expect(mockRun).toHaveBeenCalledTimes(2);
  });

  it('should register cleanup on unmount', () => {
    const params = { dataSource: 'Sample ECommerce' };
    useGetDataSourceDimensions(params);

    expect(mockDestroy).not.toHaveBeenCalled();
    expect(onBeforeUnmountCallbacks.length).toBe(1);

    const cleanupFn = onBeforeUnmountCallbacks[0];
    cleanupFn();

    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it('should track composable usage', async () => {
    const { useTracking } = await import('./use-tracking');
    const params = { dataSource: 'Sample ECommerce' };
    useGetDataSourceDimensions(params);

    expect(useTracking).toHaveBeenCalledWith('useGetDataSourceDimensions');
  });
});
