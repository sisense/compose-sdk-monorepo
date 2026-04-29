/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';

import { CartesianChartDataOptionsInternal } from '../chart-data-options/types';
import { getCategoryTooltipSettings } from './tooltip';
import { HighchartsDataPointContext } from './translations/tooltip-utils';

const createChartDataOptions = (
  overrides: Partial<CartesianChartDataOptionsInternal> = {},
): CartesianChartDataOptionsInternal => ({
  x: [{ column: { name: 'x_col', type: 'string' }, enabled: true }],
  y: [
    {
      column: { title: 'Revenue', name: 'revenue', type: 'number' },
      enabled: true,
      chartType: 'column',
    },
  ],
  breakBy: [],
  ...overrides,
});

const createPointContext = (
  overrides: Partial<HighchartsDataPointContext> = {},
): HighchartsDataPointContext => ({
  series: { name: 'revenue', color: '#111111' },
  x: '2024',
  y: 100,
  point: { name: '', color: '#222222', y: 100 },
  ...overrides,
});

describe('getCategoryTooltipSettings', () => {
  it('returns tooltip settings with a formatter function', () => {
    const settings = getCategoryTooltipSettings(undefined, createChartDataOptions());
    expect(settings.useHTML).toBe(true);
    expect(typeof settings.formatter).toBe('function');
  });

  it('formatter renders series name and value', () => {
    const settings = getCategoryTooltipSettings(undefined, createChartDataOptions());
    const html = settings.formatter!.call(createPointContext());
    expect(html).toContain('revenue');
    expect(html).toContain('100');
  });

  it('formatter uses string xDisplayValue as the x label', () => {
    const settings = getCategoryTooltipSettings(undefined, createChartDataOptions());
    const ctx = createPointContext({
      point: {
        name: '',
        color: '#222',
        y: 50,
        custom: { xDisplayValue: 'Jan 2024' },
      },
    });
    const html = settings.formatter!.call(ctx);
    expect(html).toContain('Jan 2024');
  });

  it('formatter joins array xDisplayValue with a comma-space separator', () => {
    const settings = getCategoryTooltipSettings(undefined, createChartDataOptions());
    const ctx = createPointContext({
      point: {
        name: '',
        color: '#222',
        y: 50,
        custom: { xDisplayValue: ['WEEK-31', '03.08.11'] as unknown as string },
      },
    });
    const html = settings.formatter!.call(ctx);
    expect(html).toContain('WEEK-31, 03.08.11');
  });

  it('formatter falls back to ctx.x when xDisplayValue is absent', () => {
    const settings = getCategoryTooltipSettings(undefined, createChartDataOptions());
    const ctx = createPointContext({ x: 'Q3 2023', point: { name: '', color: '', y: 0 } });
    const html = settings.formatter!.call(ctx);
    expect(html).toContain('Q3 2023');
  });

  it('formatter appends rounded percentage when showDecimals is falsy', () => {
    const settings = getCategoryTooltipSettings(false, createChartDataOptions());
    const ctx = createPointContext({ percentage: 33.7 });
    const html = settings.formatter!.call(ctx);
    expect(html).toContain('/ 34%');
  });

  it('formatter appends decimal percentage when showDecimals is true', () => {
    const settings = getCategoryTooltipSettings(true, createChartDataOptions());
    const ctx = createPointContext({ percentage: 33.7 });
    const html = settings.formatter!.call(ctx);
    expect(html).toContain('/ 33.7%');
  });
});
