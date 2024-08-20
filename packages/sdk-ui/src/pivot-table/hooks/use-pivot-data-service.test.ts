/* eslint-disable @typescript-eslint/unbound-method */
import { renderHook } from '@testing-library/react';
import { usePivotDataService } from './use-pivot-data-service';
import { DataService, PivotBuilder, PivotClient } from '@sisense/sdk-pivot-client';
import { describe, it, expect, vi } from 'vitest';

describe('usePivotDataService', () => {
  it('should create initial data service', () => {
    let dataServiceCounter = 0;
    const pivotClient = {
      prepareDataService: vi.fn(
        () => `dataService_${dataServiceCounter++}` as unknown as DataService,
      ),
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
    expect(result.current).toBe('dataService_0');
  });

  it('should recreate data service when shouldBeRecreated is true', () => {
    let dataServiceCounter = 0;
    const pivotClient = {
      prepareDataService: vi.fn(() => {
        return `dataService_${dataServiceCounter++}` as unknown as DataService;
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
    expect(result.current).toBe('dataService_0');

    rerender({ pivotBuilder, pivotClient, shouldBeRecreated: true });

    expect(pivotClient.prepareDataService).toHaveBeenCalledTimes(2);
    expect(result.current).toBe('dataService_1');
  });

  it('should not recreate data service when shouldBeRecreated is false', () => {
    const pivotClient = {
      prepareDataService: vi.fn(() => ({} as DataService)),
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
});
