/* eslint-disable @typescript-eslint/unbound-method */
import { PivotBuilder, PivotClient } from '@sisense/sdk-pivot-client';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePivotBuilder } from './use-pivot-builder';

const createPivotBuilderMock = (name = 'mockedPivotBuilder') => {
  return {
    name,
    destroy: vi.fn(),
  };
};

const getPivotBuilderMockName = (pivotBuilder: PivotBuilder) => {
  return (pivotBuilder as unknown as { name: string }).name;
};

describe('usePivotBuilder', () => {
  it('should create initial pivotBuilder', () => {
    let pivotBuilderCounter = 0;
    const pivotClient = {
      preparePivotBuilder: vi.fn(() =>
        createPivotBuilderMock(`pivotBuilder_${pivotBuilderCounter++}`),
      ),
    } as unknown as PivotClient;

    const { result } = renderHook(() =>
      usePivotBuilder({
        pivotClient,
      }),
    );

    expect(pivotClient.preparePivotBuilder).toHaveBeenCalledTimes(1);
    expect(getPivotBuilderMockName(result.current)).toBe('pivotBuilder_0');
  });

  it('should recreate pivotBuilder when pivotClient changed', () => {
    let pivotBuilderCounter = 0;
    const pivotClient = {
      preparePivotBuilder: vi.fn(() => {
        return createPivotBuilderMock(`pivotBuilder_${pivotBuilderCounter++}`);
      }),
    } as unknown as PivotClient;

    const newPivotClient = {
      preparePivotBuilder: vi.fn(() => {
        return createPivotBuilderMock(`pivotBuilder_${pivotBuilderCounter++}_by_newPivotClient`);
      }),
    } as unknown as PivotClient;

    const { rerender, result } = renderHook(
      ({ pivotClient }) =>
        usePivotBuilder({
          pivotClient,
        }),
      {
        initialProps: {
          pivotClient,
        },
      },
    );

    expect(pivotClient.preparePivotBuilder).toHaveBeenCalledTimes(1);
    expect(getPivotBuilderMockName(result.current)).toBe('pivotBuilder_0');

    rerender({ pivotClient: newPivotClient });

    expect(newPivotClient.preparePivotBuilder).toHaveBeenCalledTimes(1);
    expect(getPivotBuilderMockName(result.current)).toBe('pivotBuilder_1_by_newPivotClient');
  });

  it('should cleanup old pivotBuilder instance', () => {
    let pivotBuilderCounter = 0;
    const pivotClient = {
      preparePivotBuilder: vi.fn(() => {
        return createPivotBuilderMock(`pivotBuilder_${pivotBuilderCounter++}`);
      }),
    } as unknown as PivotClient;

    const newPivotClient = {
      preparePivotBuilder: vi.fn(() => {
        return createPivotBuilderMock(`pivotBuilder_${pivotBuilderCounter++}_by_newPivotClient`);
      }),
    } as unknown as PivotClient;

    const { rerender, result } = renderHook(
      ({ pivotClient }) =>
        usePivotBuilder({
          pivotClient,
        }),
      {
        initialProps: {
          pivotClient,
        },
      },
    );

    const oldPivotBuilder = result.current;

    rerender({ pivotClient: newPivotClient });

    expect(oldPivotBuilder.destroy).toHaveBeenCalledTimes(1);
  });
});
