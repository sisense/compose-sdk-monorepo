import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChartData } from '@/domains/visualizations/core/chart-data/types';
import { ChartType } from '@/types';

import { useChartOnReady } from './use-chart-on-ready.js';

const sankeyWithLinks = {
  type: 'sankey',
  nodes: [{ id: 'a' }, { id: 'b' }],
  links: [{ source: 'a', target: 'b', value: 1 }],
} as unknown as ChartData;

const sankeyEmptyLinks = {
  type: 'sankey',
  nodes: [],
  links: [],
} as unknown as ChartData;

type HookInput = {
  chartType: ChartType;
  isLoading: boolean;
  hasNoDimensions: boolean;
  chartData: ChartData | null;
  onReady?: () => void;
};

describe('useChartOnReady', () => {
  it('returns a paint handler for a participating chart type (sankey)', () => {
    const { result } = renderHook(() =>
      useChartOnReady({
        chartType: 'sankey',
        isLoading: false,
        hasNoDimensions: false,
        chartData: sankeyWithLinks,
      }),
    );
    expect(result.current.onRendererReady).toBeTypeOf('function');
  });

  it('returns no paint handler for a restructured chart type without the contract', () => {
    const { result } = renderHook(() =>
      useChartOnReady({
        chartType: 'column',
        isLoading: false,
        hasNoDimensions: false,
        chartData: null,
      }),
    );
    expect(result.current.onRendererReady).toBeUndefined();
  });

  it('returns no paint handler for a non-restructured chart type', () => {
    const { result } = renderHook(() =>
      useChartOnReady({
        chartType: 'indicator',
        isLoading: false,
        hasNoDimensions: false,
        chartData: null,
      }),
    );
    expect(result.current.onRendererReady).toBeUndefined();
  });

  it('fires onReady after renderer paint when not loading (sankey)', () => {
    const onReady = vi.fn();
    const { result } = renderHook(() =>
      useChartOnReady({
        chartType: 'sankey',
        isLoading: false,
        hasNoDimensions: false,
        chartData: sankeyWithLinks,
        onReady,
      }),
    );

    expect(onReady).not.toHaveBeenCalled();

    act(() => {
      result.current.onRendererReady?.();
    });

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('fires onReady for the empty state without waiting for paint (sankey)', () => {
    const onReady = vi.fn();
    renderHook(() =>
      useChartOnReady({
        chartType: 'sankey',
        isLoading: false,
        hasNoDimensions: false,
        chartData: sankeyEmptyLinks,
        onReady,
      }),
    );

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('fires again on a loading → paint refetch cycle (sankey)', () => {
    const onReady = vi.fn();
    let isLoading = false;
    const { result, rerender } = renderHook(() =>
      useChartOnReady({
        chartType: 'sankey',
        isLoading,
        hasNoDimensions: false,
        chartData: sankeyWithLinks,
        onReady,
      }),
    );

    act(() => {
      result.current.onRendererReady?.();
    });
    expect(onReady).toHaveBeenCalledTimes(1);

    // Refetch: loading resets the paint flag, so readiness falls back to false.
    act(() => {
      isLoading = true;
    });
    rerender();

    act(() => {
      isLoading = false;
    });
    rerender();
    act(() => {
      result.current.onRendererReady?.();
    });

    expect(onReady).toHaveBeenCalledTimes(2);
  });

  it('never fires for a non-participating chart type', () => {
    const onReady = vi.fn();
    const { rerender } = renderHook((props: HookInput) => useChartOnReady(props), {
      initialProps: {
        chartType: 'column',
        isLoading: true,
        hasNoDimensions: false,
        chartData: null,
        onReady,
      },
    });

    rerender({
      chartType: 'column',
      isLoading: false,
      hasNoDimensions: false,
      chartData: sankeyWithLinks,
      onReady,
    });

    expect(onReady).not.toHaveBeenCalled();
  });
});
