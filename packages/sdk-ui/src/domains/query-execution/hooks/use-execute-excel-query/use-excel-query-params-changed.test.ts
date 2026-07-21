import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ExecuteExcelQueryParams } from '../../types.js';
import { useExcelQueryParamsChanged } from './use-excel-query-params-changed.js';

const baseParams = (overrides?: Partial<ExecuteExcelQueryParams>): ExecuteExcelQueryParams => ({
  mergeRows: false,
  widgetId: 'w1',
  widgetType: 'chart',
  widgetTitle: 'Revenue',
  // Minimal attribute shape is enough for the identity checks under test; a full Attribute is not needed.
  dimensions: [{ name: 'AgeRange' }] as unknown as ExecuteExcelQueryParams['dimensions'],
  ...overrides,
});

describe('useExcelQueryParamsChanged', () => {
  it('returns true on the first render (no previous params)', () => {
    const { result } = renderHook(
      (props: ExecuteExcelQueryParams) => useExcelQueryParamsChanged(props),
      {
        initialProps: baseParams(),
      },
    );

    expect(result.current).toBe(true);
  });

  it('returns false when re-rendered with equal params', () => {
    const { result, rerender } = renderHook(
      (props: ExecuteExcelQueryParams) => useExcelQueryParamsChanged(props),
      { initialProps: baseParams() },
    );

    rerender(baseParams());

    expect(result.current).toBe(false);
  });

  it.each([
    ['mergeRows', { mergeRows: true }],
    ['exportRunId', { exportRunId: 42 }],
    ['widgetId', { widgetId: 'w2' }],
    ['widgetTitle', { widgetTitle: 'Profit' }],
    ['widgetType', { widgetType: 'pivot' }],
  ] as const)('returns true when Excel meta field "%s" changes', (_label, override) => {
    const { result, rerender } = renderHook(
      (props: ExecuteExcelQueryParams) => useExcelQueryParamsChanged(props),
      { initialProps: baseParams() },
    );

    rerender(baseParams(override));

    expect(result.current).toBe(true);
  });

  it('returns true when the underlying query params (dimensions) change', () => {
    const { result, rerender } = renderHook(
      (props: ExecuteExcelQueryParams) => useExcelQueryParamsChanged(props),
      { initialProps: baseParams() },
    );

    rerender(
      baseParams({
        dimensions: [{ name: 'Gender' }] as unknown as ExecuteExcelQueryParams['dimensions'],
      }),
    );

    expect(result.current).toBe(true);
  });
});
