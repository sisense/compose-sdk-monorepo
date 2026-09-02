import { measureFactory } from '@sisense/sdk-data';

import { Commerce } from '@/__test-helpers__/sample-ecommerce';
import { SankeyChartDataOptions } from '@/domains/visualizations/core/chart-data-options/types.js';
import type { GenericDataOptions, KpiChartDataOptions } from '@/types';

import { toCustomWidgetPanels, toKpiPanels, toSankeyPanels } from './to-widget-dto-panels';

describe('toCustomWidgetPanels', () => {
  it('returns an empty array when dataOptions is undefined', () => {
    expect(toCustomWidgetPanels(undefined)).toEqual([]);
  });

  it('returns an empty array when dataOptions is an empty object', () => {
    expect(toCustomWidgetPanels({} as GenericDataOptions)).toEqual([]);
  });

  it('emits one panel per dataOptions key, preserving the key as the panel name', () => {
    const dataOptions: GenericDataOptions = {
      category: [{ column: Commerce.AgeRange }],
      breakBy: [{ column: Commerce.Condition }],
    } as unknown as GenericDataOptions;

    const panels = toCustomWidgetPanels(dataOptions);

    expect(panels).toHaveLength(2);
    expect(panels.map((p) => p.name)).toEqual(['category', 'breakBy']);
  });

  it('skips the reserved "filters" panel key', () => {
    const dataOptions: GenericDataOptions = {
      category: [{ column: Commerce.AgeRange }],
      filters: [{ column: Commerce.Condition }],
    } as unknown as GenericDataOptions;

    const panels = toCustomWidgetPanels(dataOptions);

    expect(panels).toHaveLength(1);
    expect(panels[0].name).toBe('category');
  });

  it('produces an attribute panel item carrying the attribute JAQL', () => {
    const dataOptions: GenericDataOptions = {
      category: [{ column: Commerce.AgeRange }],
    } as unknown as GenericDataOptions;

    const [panel] = toCustomWidgetPanels(dataOptions);

    expect(panel.items).toHaveLength(1);
    const jaql = panel.items[0].jaql as { dim?: string; agg?: string };
    expect(jaql.dim).toBe('[Commerce.Age Range]');
    expect(jaql.agg).toBeUndefined();
  });

  it('produces a measure panel item with dim + agg from measureFactory', () => {
    const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
    const dataOptions: GenericDataOptions = {
      value: [{ column: sumRevenue }],
    } as unknown as GenericDataOptions;

    const [panel] = toCustomWidgetPanels(dataOptions);

    const jaql = panel.items[0].jaql as { dim?: string; agg?: string };
    expect(jaql.dim).toBe('[Commerce.Revenue]');
    expect(jaql.agg).toBe('sum');
  });

  it('ignores entries whose value is not an array', () => {
    const dataOptions = {
      category: [{ column: Commerce.AgeRange }],
      bogus: 'not-an-array',
    } as unknown as GenericDataOptions;

    const panels = toCustomWidgetPanels(dataOptions);

    expect(panels).toHaveLength(1);
    expect(panels[0].name).toBe('category');
  });

  it('emits an empty items array for keys with no columns', () => {
    const dataOptions: GenericDataOptions = {
      category: [],
    } as unknown as GenericDataOptions;

    const panels = toCustomWidgetPanels(dataOptions);

    expect(panels).toEqual([{ name: 'category', items: [] }]);
  });
});

describe('toSankeyPanels', () => {
  it('emits category and value panels matching the sankey manifest', () => {
    const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
    const dataOptions: SankeyChartDataOptions = {
      category: [Commerce.AgeRange, Commerce.Condition],
      value: sumRevenue,
    };

    const panels = toSankeyPanels(dataOptions);

    expect(panels.map((panel) => panel.name)).toEqual(['category', 'value']);
    expect(panels[0].items).toHaveLength(2);
    expect(panels[1].items).toHaveLength(1);
    expect((panels[1].items[0].jaql as { agg?: string }).agg).toBe('sum');
  });

  it('writes MultiColumnValueToColorMap onto matching category item format.members', () => {
    const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
    const dataOptions: SankeyChartDataOptions = {
      category: [Commerce.AgeRange, Commerce.Condition],
      value: sumRevenue,
      // Keys must match normalizeName(jaql.title) — "Age Range" → "AgeRange".
      seriesToColorMap: {
        AgeRange: { '65+': '#ff0000', '0-18': '#00ff00' },
        Condition: { New: '#0000ff' },
      },
    };

    const panels = toSankeyPanels(dataOptions);
    const [ageItem, conditionItem] = panels[0].items;

    expect(ageItem.format?.members).toEqual({
      '65+': { color: '#ff0000', colored: true, isHandPickedColor: true },
      '0-18': { color: '#00ff00', colored: true, isHandPickedColor: true },
    });
    expect(conditionItem.format?.members).toEqual({
      New: { color: '#0000ff', colored: true, isHandPickedColor: true },
    });
  });

  it('writes flat ValueToColorMap onto every category stage format.members', () => {
    // Flat maps resolve by display name at runtime across stages — persist the
    // same members on each Fusion category item so colors are not dropped on save.
    const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
    const dataOptions: SankeyChartDataOptions = {
      category: [Commerce.AgeRange, Commerce.Condition],
      value: sumRevenue,
      seriesToColorMap: {
        '65+': '#ff0000',
        New: '#0000ff',
      },
    };

    const panels = toSankeyPanels(dataOptions);
    const expectedMembers = {
      '65+': { color: '#ff0000', colored: true, isHandPickedColor: true },
      New: { color: '#0000ff', colored: true, isHandPickedColor: true },
    };

    expect(panels[0].items[0].format?.members).toEqual(expectedMembers);
    expect(panels[0].items[1].format?.members).toEqual(expectedMembers);
  });
});

describe('toKpiPanels', () => {
  const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');

  it('emits only the value panel when category and comparison are unset', () => {
    const dataOptions: KpiChartDataOptions = { value: sumRevenue };

    const panels = toKpiPanels(dataOptions);

    expect(panels.map((panel) => panel.name)).toEqual(['value']);
    expect((panels[0].items[0].jaql as { agg?: string }).agg).toBe('sum');
  });

  it('emits a category panel when set', () => {
    const dataOptions: KpiChartDataOptions = { value: sumRevenue, category: Commerce.AgeRange };

    const panels = toKpiPanels(dataOptions);

    expect(panels.map((panel) => panel.name)).toEqual(['value', 'category']);
  });

  it('emits a target panel for a measure-column target comparison', () => {
    const target = measureFactory.sum(Commerce.Cost, 'Cost Target');
    const dataOptions: KpiChartDataOptions = {
      value: sumRevenue,
      comparison: { type: 'target', target },
    };

    const panels = toKpiPanels(dataOptions);

    expect(panels.map((panel) => panel.name)).toEqual(['value', 'target']);
  });

  it('writes a literal-number target as a constant formula panel item', () => {
    // Fusion has no literal-number item; a fixed goal is a constant formula there, so that is
    // what a number serializes to. It comes back as a measure column, not a number.
    const dataOptions: KpiChartDataOptions = {
      value: sumRevenue,
      comparison: { type: 'target', target: 10000 },
    };

    const panels = toKpiPanels(dataOptions);

    expect(panels.map((panel) => panel.name)).toEqual(['value', 'target']);
    expect(panels[1].items[0].jaql).toEqual({ formula: '10000', title: '10000' });
  });

  it('drops a non-finite target, which has no valid constant-formula form', () => {
    // Writing `{ formula: 'NaN' }` would build a panel the query engine rejects, so these fall
    // back to no target panel — and, via isSerializableKpiTarget, to a non-goal subtype.
    for (const target of [NaN, Infinity, -Infinity]) {
      const panels = toKpiPanels({
        value: sumRevenue,
        comparison: { type: 'target', target },
      });
      expect(panels.map((panel) => panel.name)).toEqual(['value']);
    }
  });

  it('writes finite edge-case targets as formulas', () => {
    for (const [target, formula] of [
      [0, '0'],
      [-500, '-500'],
      [0.5, '0.5'],
    ] as const) {
      const panels = toKpiPanels({
        value: sumRevenue,
        comparison: { type: 'target', target },
      });
      expect(panels[1].items[0].jaql).toEqual({ formula, title: formula });
    }
  });

  it('emits a comparisonValue panel for a delta comparison', () => {
    const baseline = measureFactory.sum(Commerce.Cost, 'Previous Cost');
    const dataOptions: KpiChartDataOptions = {
      value: sumRevenue,
      comparison: { type: 'delta', value: baseline },
    };

    const panels = toKpiPanels(dataOptions);

    expect(panels.map((panel) => panel.name)).toEqual(['value', 'comparisonValue']);
  });

  it('emits no comparison panel for previous-period (the subtype carries it)', () => {
    const dataOptions: KpiChartDataOptions = {
      value: sumRevenue,
      category: Commerce.AgeRange,
      comparison: { type: 'previous-period' },
    };

    const panels = toKpiPanels(dataOptions);

    expect(panels.map((panel) => panel.name)).toEqual(['value', 'category']);
  });

  it('emits a comparisonValue panel for the plain value comparison, same as delta', () => {
    const comparisonValue = measureFactory.sum(Commerce.Cost, 'Secondary');
    const dataOptions: KpiChartDataOptions = {
      value: sumRevenue,
      comparison: { type: 'value', value: comparisonValue },
    };

    const panels = toKpiPanels(dataOptions);

    expect(panels.map((panel) => panel.name)).toEqual(['value', 'comparisonValue']);
  });
});
