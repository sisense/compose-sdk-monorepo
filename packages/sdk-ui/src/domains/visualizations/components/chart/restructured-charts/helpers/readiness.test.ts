import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChartData } from '@/domains/visualizations/core/chart-data/types';
import { ChartType } from '@/types';

import { hasNoResults } from '../../components/regular-chart/has-no-results.js';
import { isRendererDataReady, isRendererReady } from './readiness.js';

vi.mock('../../components/regular-chart/has-no-results.js', () => ({
  hasNoResults: vi.fn(),
}));

const MOCK_CHART_TYPE = 'mock-chart' as ChartType;
const MOCK_CHART_DATA = { type: 'mock-chart' } as unknown as ChartData;

describe('readiness helpers', () => {
  beforeEach(() => {
    vi.mocked(hasNoResults).mockReset().mockReturnValue(false);
  });

  describe('isRendererReady', () => {
    it('is not ready while loading / unpainted', () => {
      expect(
        isRendererReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: true,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(false);

      expect(
        isRendererReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: true,
          rendererPainted: true,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(false);

      expect(
        isRendererReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: true,
          rendererPainted: false,
          hasNoDimensions: true,
          chartData: null,
        }),
      ).toBe(false);

      expect(
        isRendererReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(false);
    });

    it('is ready after paint when not loading', () => {
      expect(
        isRendererReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: false,
          rendererPainted: true,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(true);
    });

    it('is ready for empty overlay without paint (when hasNoResults returns true)', () => {
      vi.mocked(hasNoResults).mockReturnValue(true);

      expect(
        isRendererReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(true);
    });

    it('is ready for no-dimensions without paint', () => {
      expect(
        isRendererReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: true,
          chartData: null,
        }),
      ).toBe(true);
    });
  });

  describe('isRendererDataReady', () => {
    it('is not ready while loading', () => {
      expect(
        isRendererDataReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: true,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(false);

      expect(
        isRendererDataReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: true,
          rendererPainted: false,
          hasNoDimensions: true,
          chartData: null,
        }),
      ).toBe(false);

      vi.mocked(hasNoResults).mockReturnValue(true);
      expect(
        isRendererDataReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: true,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(false);
    });

    it('is ready when data is present and has results', () => {
      vi.mocked(hasNoResults).mockReturnValue(false);

      expect(
        isRendererDataReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(true);
    });

    it('is ready for empty overlay without dimensions', () => {
      expect(
        isRendererDataReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: true,
          chartData: null,
        }),
      ).toBe(true);
    });

    it('is ready for empty overlay when hasNoResults returns true', () => {
      vi.mocked(hasNoResults).mockReturnValue(true);

      expect(
        isRendererDataReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(true);
    });
  });

  describe('empty-state detection', () => {
    it.each([
      ['isRendererReady', isRendererReady],
      ['isRendererDataReady', isRendererDataReady],
    ])('routes chart type from the state into hasNoResults (%s)', (_name, isReady) => {
      vi.mocked(hasNoResults).mockReturnValue(true);

      expect(
        isReady({
          chartType: MOCK_CHART_TYPE,
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData: MOCK_CHART_DATA,
        }),
      ).toBe(true);

      expect(hasNoResults).toHaveBeenCalledWith(MOCK_CHART_TYPE, MOCK_CHART_DATA);
    });
  });
});
