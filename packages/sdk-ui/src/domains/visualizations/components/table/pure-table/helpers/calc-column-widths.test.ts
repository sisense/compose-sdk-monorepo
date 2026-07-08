/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';

import { calcColumnWidths } from './calc-column-widths.js';

describe('calcColumnWidths', () => {
  const dataTable = {
    columns: [{ name: 'Short', type: 'string', index: 0, direction: 0 }],
    rows: [[{ displayValue: 'A' }]],
  };

  it('clamps content-based widths to the default min/max bounds', () => {
    const widths = calcColumnWidths(dataTable, false, [{ isHtml: false }]);
    expect(widths[0]).toBeGreaterThanOrEqual(120);
    expect(widths[0]).toBeLessThanOrEqual(350);
  });

  it('respects custom min/max bounds when provided', () => {
    const widths = calcColumnWidths(dataTable, false, [{ isHtml: false }], {
      minWidth: 80,
      maxWidth: 200,
    });
    expect(widths[0]).toBeGreaterThanOrEqual(80);
    expect(widths[0]).toBeLessThanOrEqual(200);
  });

  const longContentDataTable = {
    columns: [{ name: 'Short', type: 'string', index: 0, direction: 0 }],
    rows: [[{ displayValue: 'x'.repeat(400) }]],
  };

  it('clamps content-based widths to the default max bound for long content', () => {
    const widths = calcColumnWidths(longContentDataTable, false, [{ isHtml: false }]);
    expect(widths[0]).toBe(350);
  });

  it('clamps content-based widths to a custom max bound for long content', () => {
    const widths = calcColumnWidths(longContentDataTable, false, [{ isHtml: false }], {
      minWidth: 80,
      maxWidth: 200,
    });
    expect(widths[0]).toBe(200);
  });

  it('normalizes a misconfigured bounds pair so the effective max is never below the effective min', () => {
    const widths = calcColumnWidths(dataTable, false, [{ isHtml: false }], {
      minWidth: 200,
      maxWidth: 80,
    });
    expect(widths[0]).toBe(80);
  });
});
