import { describe, expect, it, vi } from 'vitest';

import { applyOnReadyToHighchartsOptions } from './apply-on-ready-to-highcharts-options.js';
import { HighchartsOptionsInternal } from './chart-options-processor/chart-options-service.js';

const baseOptions = {
  chart: {
    type: 'column',
    polar: false,
  },
  series: [],
} satisfies HighchartsOptionsInternal;

describe('applyOnReadyToHighchartsOptions', () => {
  it('wraps load/render and preserves existing handlers', () => {
    const onReady = vi.fn();
    const existingLoad = vi.fn();
    const existingRender = vi.fn();

    const next = applyOnReadyToHighchartsOptions(
      {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          events: {
            load: existingLoad,
            render: existingRender,
          },
        },
      },
      onReady,
    );

    next.chart.events?.load?.();
    expect(existingLoad).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledTimes(1);

    next.chart.events?.render?.();
    expect(existingRender).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledTimes(2);
  });

  it('forwards Highcharts chart context (`this`) to existing handlers', () => {
    const onReady = vi.fn();
    const chartContext = { chartWidth: 640, chartHeight: 400 };
    const existingLoad = vi.fn(function (this: typeof chartContext) {
      expect(this).toBe(chartContext);
      expect(this.chartWidth).toBe(640);
    });
    const existingRender = vi.fn(function (this: typeof chartContext) {
      expect(this).toBe(chartContext);
    });

    const next = applyOnReadyToHighchartsOptions(
      {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          events: {
            load: existingLoad,
            render: existingRender,
          },
        },
      },
      onReady,
    );

    next.chart.events?.load?.call(chartContext);
    next.chart.events?.render?.call(chartContext);

    expect(existingLoad).toHaveBeenCalledTimes(1);
    expect(existingRender).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledTimes(2);
  });

  it('adds load/render when none exist', () => {
    const onReady = vi.fn();
    const next = applyOnReadyToHighchartsOptions(baseOptions, onReady);

    expect(next.chart.events?.load).toBeTypeOf('function');
    expect(next.chart.events?.render).toBeTypeOf('function');

    next.chart.events?.load?.();
    next.chart.events?.render?.();
    expect(onReady).toHaveBeenCalledTimes(2);
  });
});
