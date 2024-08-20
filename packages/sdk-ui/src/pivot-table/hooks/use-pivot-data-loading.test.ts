import { renderHook, waitFor } from '@testing-library/react';
import { usePivotDataLoading } from './use-pivot-data-loading';
import {
  PivotBuilder,
  EVENT_QUERY_START,
  EVENT_QUERY_END,
  JaqlRequest,
  JaqlPanel,
} from '@sisense/sdk-pivot-client';

type AnyFunction = (...args: any[]) => any;

// Mock the PivotBuilder
class MockPivotBuilder extends PivotBuilder {
  listeners: Record<string, AnyFunction[]> = {};

  on(event: string, callback: AnyFunction) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: AnyFunction) {
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  trigger(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  updateJaql() {
    // Mock updateJaql method
  }
}

const pivotJaqlMock: JaqlRequest = { metadata: [] };

describe('usePivotDataLoading', () => {
  let mockPivotBuilder: MockPivotBuilder;

  beforeEach(() => {
    mockPivotBuilder = new MockPivotBuilder();
  });

  it('should initialize with isLoading = false and isNoResults = false', () => {
    const { result } = renderHook(() =>
      usePivotDataLoading({
        jaql: undefined,
        pivotBuilder: mockPivotBuilder,
        isForceReload: false,
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isNoResults).toBe(false);
  });

  it('should return isLoading === true and isNoResults === false on EVENT_QUERY_START', async () => {
    const { result } = renderHook(() =>
      usePivotDataLoading({
        jaql: pivotJaqlMock,
        pivotBuilder: mockPivotBuilder,
        isForceReload: false,
      }),
    );

    // Trigger the EVENT_QUERY_START event
    mockPivotBuilder.trigger(EVENT_QUERY_START);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isNoResults).toBe(false);
    });
  });

  it('should set isLoading to false and isNoResults based on results availability in EVENT_QUERY_END', async () => {
    const { result } = renderHook(() =>
      usePivotDataLoading({
        jaql: undefined,
        pivotBuilder: mockPivotBuilder,
        isForceReload: false,
      }),
    );

    // Trigger the EVENT_QUERY_START event
    mockPivotBuilder.trigger(EVENT_QUERY_START);

    // Trigger the EVENT_QUERY_END event with no results
    mockPivotBuilder.trigger(EVENT_QUERY_END, { cellsMetadata: undefined });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isNoResults).toBe(true);
    });

    // Trigger the EVENT_QUERY_END event with results
    mockPivotBuilder.trigger(EVENT_QUERY_END, { cellsMetadata: {} });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isNoResults).toBe(false);
    });
  });

  it('should call jaql update in pivotBuilder when jaql changes or isForceReload is true', () => {
    const mockJaql: JaqlRequest = {
      metadata: ['some initial jaql metadata' as unknown as JaqlPanel],
    };

    const { rerender } = renderHook(
      (props) =>
        usePivotDataLoading({
          jaql: props.jaql,
          pivotBuilder: mockPivotBuilder,
          isForceReload: props.isForceReload,
        }),
      {
        initialProps: { jaql: mockJaql, isForceReload: false },
      },
    );

    const spy = vi.spyOn(mockPivotBuilder, 'updateJaql');

    const newJaql = {
      ...mockJaql,
      metadata: [...mockJaql.metadata, 'new jaql metadata' as unknown as JaqlPanel],
    };
    // Rerender with a new JAQL object
    rerender({ jaql: newJaql, isForceReload: false });
    expect(spy).toHaveBeenCalledWith(newJaql);
    expect(spy).toHaveBeenCalledTimes(1);

    // Rerender with the same JAQL object
    rerender({ jaql: newJaql, isForceReload: false });
    expect(spy).toHaveBeenCalledTimes(1);

    // Rerender with force reload set to true
    rerender({ jaql: newJaql, isForceReload: true });
    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });
});
