/** @vitest-environment jsdom */
import type { CalculatedMeasure } from '@sisense/sdk-data';
import {
  HookAdapter,
  type SharedFormulaState,
  useGetSharedFormulaInternal,
} from '@sisense/sdk-ui-preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useGetSharedFormula } from './use-get-shared-formula';

// Mock dependencies
vi.mock('@sisense/sdk-ui-preact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    useGetSharedFormulaInternal: vi.fn(),
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

// Mock Vue's onBeforeUnmount to capture cleanup callbacks
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

describe('useGetSharedFormula', () => {
  let mockSubscribe: ReturnType<typeof vi.fn>;
  let mockRun: ReturnType<typeof vi.fn>;
  let mockDestroy: ReturnType<typeof vi.fn>;
  let subscribeCallback: ((result: SharedFormulaState) => void) | null;

  beforeEach(() => {
    vi.clearAllMocks();
    onBeforeUnmountCallbacks.length = 0;
    subscribeCallback = null;

    mockSubscribe = vi.fn((callback: (result: SharedFormulaState) => void) => {
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

  it('should create HookAdapter with useGetSharedFormulaInternal', () => {
    const params = { oid: 'test-oid' };
    useGetSharedFormula(params);

    expect(MockHookAdapter).toHaveBeenCalledWith(useGetSharedFormulaInternal, expect.any(Array));
    expect(MockHookAdapter).toHaveBeenCalledTimes(1);
  });

  it('should subscribe to hook adapter', () => {
    const params = { oid: 'test-oid' };
    useGetSharedFormula(params);

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(typeof subscribeCallback).toBe('function');
  });

  it('should run hook adapter with initial parameters', () => {
    const params = { oid: 'test-oid-123' };
    useGetSharedFormula(params);

    expect(mockRun).toHaveBeenCalledWith({ oid: 'test-oid-123' });
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('should return reactive state with initial loading state', () => {
    const params = { oid: 'test-oid' };
    const result = useGetSharedFormula(params);

    expect(result.isLoading.value).toBe(true);
    expect(result.isError.value).toBe(false);
    expect(result.isSuccess.value).toBe(false);
    expect(result.status.value).toBe('loading');
    expect(result.formula.value).toBeNull();
    expect(result.error.value).toBeUndefined();
  });

  it('should update state when hook emits success result', async () => {
    const mockFormula: CalculatedMeasure = {
      name: 'Test Formula',
      expression: '[Sales] + [Cost]',
    } as CalculatedMeasure;

    const mockResult: SharedFormulaState = {
      isSuccess: true,
      isLoading: false,
      isError: false,
      error: undefined,
      formula: mockFormula,
      status: 'success',
    };

    const params = { oid: 'test-oid' };
    const result = useGetSharedFormula(params);

    // Simulate hook adapter emitting result
    if (subscribeCallback) {
      subscribeCallback(mockResult);
    }

    await nextTick();

    expect(result.isLoading.value).toBe(false);
    expect(result.isError.value).toBe(false);
    expect(result.isSuccess.value).toBe(true);
    expect(result.status.value).toBe('success');
    expect(result.formula.value).toEqual(mockFormula);
    expect(result.error.value).toBeUndefined();
  });

  it('should update state when hook emits error result', async () => {
    const mockError = new Error('Formula not found');
    const mockResult: SharedFormulaState = {
      isSuccess: false,
      isLoading: false,
      isError: true,
      error: mockError,
      formula: undefined,
      status: 'error',
    };

    const params = { oid: 'invalid-oid' };
    const result = useGetSharedFormula(params);

    // Simulate hook adapter emitting error
    if (subscribeCallback) {
      subscribeCallback(mockResult);
    }

    await nextTick();

    expect(result.isLoading.value).toBe(false);
    expect(result.isError.value).toBe(true);
    expect(result.isSuccess.value).toBe(false);
    expect(result.status.value).toBe('error');
    expect(result.formula.value).toBeUndefined();
    expect(result.error.value).toEqual(mockError);
  });

  it('should handle null formula when not found', async () => {
    const mockResult: SharedFormulaState = {
      isSuccess: true,
      isLoading: false,
      isError: false,
      error: undefined,
      formula: null,
      status: 'success',
    };

    const params = { oid: 'non-existent-oid' };
    const result = useGetSharedFormula(params);

    if (subscribeCallback) {
      subscribeCallback(mockResult);
    }

    await nextTick();

    expect(result.isSuccess.value).toBe(true);
    expect(result.formula.value).toBeNull();
  });

  it('should support reactive parameters with refs', async () => {
    const oidRef = ref('initial-oid');
    const params = { oid: oidRef };
    useGetSharedFormula(params);

    // Initial call
    expect(mockRun).toHaveBeenCalledWith({ oid: 'initial-oid' });
    expect(mockRun).toHaveBeenCalledTimes(1);

    // Update ref
    oidRef.value = 'updated-oid';
    await nextTick();

    // Should trigger re-run with updated value
    expect(mockRun).toHaveBeenCalledWith({ oid: 'updated-oid' });
    expect(mockRun).toHaveBeenCalledTimes(2);
  });

  it('should handle mixed reactive and non-reactive parameters', async () => {
    const nameRef = ref('Initial Name');
    const dataSource = { name: 'Sample ECommerce' } as any;
    const params = {
      name: nameRef,
      dataSource, // non-reactive
    };
    useGetSharedFormula(params);

    expect(mockRun).toHaveBeenCalledWith({
      name: 'Initial Name',
      dataSource,
    });

    // Update reactive parameter
    nameRef.value = 'Updated Name';
    await nextTick();

    expect(mockRun).toHaveBeenCalledWith({
      name: 'Updated Name',
      dataSource,
    });
    expect(mockRun).toHaveBeenCalledTimes(2);
  });

  it('should register cleanup on unmount', async () => {
    const params = { oid: 'test-oid' };
    useGetSharedFormula(params);

    // Verify destroy was not called yet
    expect(mockDestroy).not.toHaveBeenCalled();
    // Verify onBeforeUnmount was called to register cleanup
    expect(onBeforeUnmountCallbacks.length).toBe(1);
    expect(typeof onBeforeUnmountCallbacks[0]).toBe('function');

    // Manually call the cleanup callback to simulate component unmount
    const cleanupFn = onBeforeUnmountCallbacks[0];
    cleanupFn();

    // Verify destroy was called during cleanup
    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple state updates correctly', async () => {
    const params = { oid: 'test-oid' };
    const result = useGetSharedFormula(params);

    // First update: loading -> success
    const successResult: SharedFormulaState = {
      isSuccess: true,
      isLoading: false,
      isError: false,
      error: undefined,
      formula: { name: 'Formula 1' } as CalculatedMeasure,
      status: 'success',
    };

    if (subscribeCallback) {
      subscribeCallback(successResult);
    }
    await nextTick();

    expect(result.formula.value?.name).toBe('Formula 1');
    expect(result.isSuccess.value).toBe(true);

    // Second update: success -> error
    const errorResult: SharedFormulaState = {
      isSuccess: false,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      formula: undefined,
      status: 'error',
    };

    if (subscribeCallback) {
      subscribeCallback(errorResult);
    }
    await nextTick();

    expect(result.isError.value).toBe(true);
    expect(result.formula.value).toBeUndefined();
    expect(result.error.value?.message).toBe('Network error');
  });

  it('should convert reactive objects to plain objects before passing to hook', () => {
    const reactiveParams = {
      oid: ref('test-oid'),
      enabled: ref(true),
    };
    useGetSharedFormula(reactiveParams);

    // Should convert refs to plain values
    expect(mockRun).toHaveBeenCalledWith({
      oid: 'test-oid',
      enabled: true,
    });
  });

  it('should track composable usage', async () => {
    const { useTracking } = await import('./use-tracking');
    const params = { oid: 'test-oid' };
    useGetSharedFormula(params);

    expect(useTracking).toHaveBeenCalledWith('useGetSharedFormula');
  });
});
