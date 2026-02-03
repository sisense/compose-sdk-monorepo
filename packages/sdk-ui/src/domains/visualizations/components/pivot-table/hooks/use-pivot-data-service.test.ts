/* eslint-disable @typescript-eslint/unbound-method */
import type { DataService } from '@sisense/sdk-pivot-query-client';
import { PivotBuilder, PivotClient } from '@sisense/sdk-pivot-ui';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePivotDataService } from './use-pivot-data-service';

const createDataServiceMock = (name = 'mockedDataService') => {
  return {
    name,
    destroy: vi.fn(),
  };
};

const getDataServiceMockName = (dataService: DataService) => {
  return (dataService as unknown as { name: string }).name;
};

describe('usePivotDataService', () => {
  it('should create initial data service', () => {
    let dataServiceCounter = 0;
    const pivotClient = {
      prepareDataService: vi.fn(() => createDataServiceMock(`dataService_${dataServiceCounter++}`)),
    } as unknown as PivotClient;

    const pivotBuilder = {
      updateDataService: vi.fn(),
    } as unknown as PivotBuilder;

    const { result } = renderHook(() =>
      usePivotDataService({
        pivotClient,
        pivotBuilder,
        shouldBeRecreated: false,
      }),
    );

    expect(pivotClient.prepareDataService).toHaveBeenCalledTimes(1);
    expect(getDataServiceMockName(result.current)).toBe('dataService_0');
  });

  it('should recreate data service when shouldBeRecreated is true', () => {
    let dataServiceCounter = 0;
    const pivotClient = {
      prepareDataService: vi.fn(() => {
        return createDataServiceMock(`dataService_${dataServiceCounter++}`);
      }),
    } as unknown as PivotClient;

    const pivotBuilder = {
      updateDataService: vi.fn(),
    } as unknown as PivotBuilder;

    const { rerender, result } = renderHook(
      ({ shouldBeRecreated }) =>
        usePivotDataService({
          pivotClient,
          pivotBuilder,
          shouldBeRecreated,
        }),
      {
        initialProps: {
          pivotBuilder,
          pivotClient,
          shouldBeRecreated: false,
        },
      },
    );

    expect(pivotClient.prepareDataService).toHaveBeenCalledTimes(1);
    expect(getDataServiceMockName(result.current)).toBe('dataService_0');

    rerender({ pivotBuilder, pivotClient, shouldBeRecreated: true });

    expect(pivotClient.prepareDataService).toHaveBeenCalledTimes(2);
    expect(getDataServiceMockName(result.current)).toBe('dataService_1');
  });

  it('should not recreate data service when shouldBeRecreated is false', () => {
    const pivotClient = {
      prepareDataService: vi.fn(() => createDataServiceMock()),
    } as unknown as PivotClient;

    const pivotBuilder = {
      updateDataService: vi.fn(),
    } as unknown as PivotBuilder;

    const { rerender } = renderHook(
      ({ shouldBeRecreated }) =>
        usePivotDataService({
          pivotClient,
          pivotBuilder,
          shouldBeRecreated,
        }),
      {
        initialProps: {
          shouldBeRecreated: false,
        },
      },
    );

    expect(pivotClient.prepareDataService).toHaveBeenCalledTimes(1);

    rerender({ shouldBeRecreated: false });

    expect(pivotClient.prepareDataService).toHaveBeenCalledTimes(1);
    expect(pivotBuilder.updateDataService).not.toHaveBeenCalled();
  });

  it('should cleanup old data service instance', () => {
    let dataServiceCounter = 0;
    const pivotClient = {
      prepareDataService: vi.fn(() => {
        return createDataServiceMock(`dataService_${dataServiceCounter++}`);
      }),
    } as unknown as PivotClient;

    const pivotBuilder = {
      updateDataService: vi.fn(),
    } as unknown as PivotBuilder;

    const { rerender, result } = renderHook(
      ({ shouldBeRecreated }) =>
        usePivotDataService({
          pivotClient,
          pivotBuilder,
          shouldBeRecreated,
        }),
      {
        initialProps: {
          pivotBuilder,
          pivotClient,
          shouldBeRecreated: false,
        },
      },
    );

    const oldDataService = result.current;

    rerender({ pivotBuilder, pivotClient, shouldBeRecreated: true });

    expect(oldDataService.destroy).toHaveBeenCalledTimes(1);
  });
});
