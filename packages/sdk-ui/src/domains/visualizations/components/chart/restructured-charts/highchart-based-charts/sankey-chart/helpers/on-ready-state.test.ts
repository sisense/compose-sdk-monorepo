import { describe, expect, it } from 'vitest';

import { ChartData } from '@/domains/visualizations/core/chart-data/types';

import { isSankeyReadyForOnReady } from './on-ready-state.js';

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

describe('isSankeyReadyForOnReady', () => {
  it('is not ready while still loading / unpainted', () => {
    expect(
      isSankeyReadyForOnReady({
        isLoading: true,
        rendererPainted: false,
        hasNoDimensions: false,
        chartData: sankeyWithLinks,
      }),
    ).toBe(false);

    expect(
      isSankeyReadyForOnReady({
        isLoading: false,
        rendererPainted: false,
        hasNoDimensions: false,
        chartData: sankeyWithLinks,
      }),
    ).toBe(false);
  });

  it('is ready after renderer paint when not loading', () => {
    expect(
      isSankeyReadyForOnReady({
        isLoading: false,
        rendererPainted: true,
        hasNoDimensions: false,
        chartData: sankeyWithLinks,
      }),
    ).toBe(true);
  });

  it('resets readiness when loading again after paint (refetch cycle)', () => {
    expect(
      isSankeyReadyForOnReady({
        isLoading: true,
        rendererPainted: true,
        hasNoDimensions: false,
        chartData: sankeyWithLinks,
      }),
    ).toBe(false);
  });

  it('is ready for no-results overlay without waiting for paint', () => {
    expect(
      isSankeyReadyForOnReady({
        isLoading: false,
        rendererPainted: false,
        hasNoDimensions: false,
        chartData: sankeyEmptyLinks,
      }),
    ).toBe(true);
  });

  it('is not ready for no-results overlay while loading', () => {
    expect(
      isSankeyReadyForOnReady({
        isLoading: true,
        rendererPainted: false,
        hasNoDimensions: false,
        chartData: sankeyEmptyLinks,
      }),
    ).toBe(false);
  });

  it('is ready when there are no dimensions', () => {
    expect(
      isSankeyReadyForOnReady({
        isLoading: false,
        rendererPainted: false,
        hasNoDimensions: true,
        chartData: null,
      }),
    ).toBe(true);
  });

  it('is not ready for no-dimensions while loading', () => {
    expect(
      isSankeyReadyForOnReady({
        isLoading: true,
        rendererPainted: false,
        hasNoDimensions: true,
        chartData: null,
      }),
    ).toBe(false);
  });
});
