import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { kpiChartBuilder } from './kpi-chart-builder.js';
import { KpiChartData } from './types.js';

const chartData: KpiChartData = {
  type: 'kpi',
  hasRows: true,
  value: 1500,
  valueTitle: 'Total Revenue',
};

const dataOptions = kpiChartBuilder.dataOptions.translateDataOptionsToInternal({
  value: measureFactory.sum(DM.Commerce.Revenue),
});

describe('kpiChartBuilder', () => {
  describe('renderer wiring', () => {
    it('isCorrectRendererProps rejects an empty object', () => {
      expect(kpiChartBuilder.renderer.isCorrectRendererProps({} as never)).toBe(false);
    });

    it('ChartRendererComponent is a React component function', () => {
      expect(typeof kpiChartBuilder.renderer.ChartRendererComponent).toBe('function');
    });
  });

  describe('onReady wiring', () => {
    // The KPI renderer reports its own paint (see the paint effect in `kpi-chart-renderer.tsx`),
    // so readiness follows the chart-render contract rather than the data-only one: the card
    // must be committed to the DOM, not merely have data.
    it('is not ready on data alone, before the renderer signals paint', () => {
      expect(
        kpiChartBuilder.renderer.isReady({
          chartType: 'kpi',
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: false,
          chartData,
        }),
      ).toBe(false);
    });

    it('is ready once the renderer signals paint with a finished query', () => {
      expect(
        kpiChartBuilder.renderer.isReady({
          chartType: 'kpi',
          isLoading: false,
          rendererPainted: true,
          hasNoDimensions: false,
          chartData,
        }),
      ).toBe(true);
    });

    it('is not ready while a query is still in flight', () => {
      expect(
        kpiChartBuilder.renderer.isReady({
          chartType: 'kpi',
          isLoading: true,
          rendererPainted: true,
          hasNoDimensions: false,
          chartData,
        }),
      ).toBe(false);
    });

    it('is ready without paint when there are no dimensions to query', () => {
      expect(
        kpiChartBuilder.renderer.isReady({
          chartType: 'kpi',
          isLoading: false,
          rendererPainted: false,
          hasNoDimensions: true,
          chartData: null,
        }),
      ).toBe(true);
    });
  });

  describe('dataOptions wiring', () => {
    it('translates to internal and isCorrectDataOptionsInternal confirms the shape', () => {
      expect(kpiChartBuilder.dataOptions.isCorrectDataOptionsInternal(dataOptions)).toBe(true);
    });
  });
});
