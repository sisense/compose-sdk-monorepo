import { measureFactory } from '@sisense/sdk-data';

import { Commerce } from '@/__test-helpers__/sample-ecommerce';
import type {
  SankeyChartDataOptions,
  TableDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import { createDataOptionsFromPanels } from '@/domains/widgets/components/widget-by-id/translate-widget-data-options';
import type { GenericDataOptions, KpiChartDataOptions } from '@/types';

import {
  toCustomWidgetPanels,
  toKpiPanels,
  toSankeyPanels,
  toTablePanels,
} from './to-widget-dto-panels';

describe('custom widget panel name round trip', () => {
  // A plugin's `DataPanelInput.name` is the persistence key: saving writes the dataOptions key as
  // the panel name, loading reads it back as `camelCase(panel.name)`.
  const saveAndLoad = (dataOptions: GenericDataOptions) =>
    createDataOptionsFromPanels(toCustomWidgetPanels(dataOptions), []);

  it('keeps a camelCase input name stable across save and load', () => {
    const dataOptions = {
      breakBy: [{ column: Commerce.Condition }],
    } as unknown as GenericDataOptions;

    const loaded = saveAndLoad(dataOptions);

    expect(Object.keys(loaded)).toEqual(['breakBy']);
    expect(toCustomWidgetPanels(loaded as GenericDataOptions).map((p) => p.name)).toEqual([
      'breakBy',
    ]);
  });

  it('renames a non-camelCase input name to its camelCase form on load', () => {
    const dataOptions = {
      'break-by': [{ column: Commerce.Condition }],
    } as unknown as GenericDataOptions;

    expect(toCustomWidgetPanels(dataOptions).map((p) => p.name)).toEqual(['break-by']);
    expect(Object.keys(saveAndLoad(dataOptions))).toEqual(['breakBy']);
  });
});

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

describe('toTablePanels', () => {
  it('writes jaql.sort from measure sortType', () => {
    const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
    const dataOptions: TableDataOptionsInternal = {
      columns: [{ column: Commerce.AgeRange }, { column: sumRevenue, sortType: 'sortDesc' }],
    };

    const [panel] = toTablePanels(dataOptions);

    expect(panel.name).toBe('columns');
    expect(panel.items).toHaveLength(2);
    expect(panel.items[0].jaql.sort).toBeUndefined();
    expect(panel.items[1].jaql.sort).toBe('desc');
  });

  it('writes jaql.sort from attribute sortType', () => {
    const dataOptions: TableDataOptionsInternal = {
      columns: [{ column: Commerce.AgeRange, sortType: 'sortAsc' }],
    };

    const [panel] = toTablePanels(dataOptions);

    expect(panel.items[0].jaql.sort).toBe('asc');
  });

  it('preserves display column order when a measure precedes an attribute', () => {
    const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
    const dataOptions: TableDataOptionsInternal = {
      columns: [
        { column: sumRevenue, sortType: 'sortDesc', width: 180 },
        { column: Commerce.AgeRange },
      ],
    };

    const [panel] = toTablePanels(dataOptions);
    const dims = panel.items.map((item) => (item.jaql as { dim?: string }).dim);

    expect(dims).toEqual(['[Commerce.Revenue]', '[Commerce.Age Range]']);
    expect(panel.items[0].jaql.sort).toBe('desc');
    expect(panel.items[0].format?.width).toBe(180);
  });

  it('skips derived result columns', () => {
    const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
    const dataOptions: TableDataOptionsInternal = {
      columns: [
        { column: Commerce.AgeRange },
        { column: sumRevenue },
        { name: '$measure0_$forecast_Revenue_upper', title: 'Upper Bound' },
      ],
    };

    const [panel] = toTablePanels(dataOptions);

    expect(panel.items).toHaveLength(2);
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
  const sumCost = measureFactory.sum(Commerce.Cost, 'Total Cost');
  // Fusion's kpi manifest order. Fusion backfills each saved panel's type and title from the
  // manifest by position and never recreates a missing panel, so all four must always be there.
  const manifestOrder = ['value', 'category', 'target', 'comparisonValue'];

  const comparisons: ReadonlyArray<[string, KpiChartDataOptions['comparison']]> = [
    ['none', undefined],
    ['previous-period', { type: 'previous-period' }],
    ['delta', { type: 'delta', value: sumCost }],
    ['value', { type: 'value', value: sumCost }],
    ['target with a measure', { type: 'target', target: sumCost }],
    ['target with a number', { type: 'target', target: 10000 }],
  ];
  const categories: ReadonlyArray<[string, KpiChartDataOptions['category']]> = [
    ['without a category', undefined],
    ['with a category', Commerce.AgeRange],
  ];

  describe.each(comparisons)('comparison: %s', (_, comparison) => {
    it.each(categories)('emits all four panels in manifest order %s', (__, category) => {
      const panels = toKpiPanels({
        value: sumRevenue,
        ...(category && { category }),
        ...(comparison && { comparison }),
      });

      expect(panels.map((panel) => panel.name)).toEqual(manifestOrder);
      expect(panels[0].items).toHaveLength(1);
      expect(panels[1].items).toHaveLength(category ? 1 : 0);
    });
  });

  it('writes the value measure into the value panel', () => {
    const panels = toKpiPanels({ value: sumRevenue });

    expect((panels[0].items[0].jaql as { agg?: string }).agg).toBe('sum');
  });

  it('leaves category, target and comparisonValue empty when only value is set', () => {
    const panels = toKpiPanels({ value: sumRevenue });

    expect(panels.slice(1)).toEqual([
      { name: 'category', items: [] },
      { name: 'target', items: [] },
      { name: 'comparisonValue', items: [] },
    ]);
  });

  it('writes the category into the category panel when set', () => {
    const panels = toKpiPanels({ value: sumRevenue, category: Commerce.AgeRange });

    expect(panels[1].items).toHaveLength(1);
    expect((panels[1].items[0].jaql as { dim?: string }).dim).toBe('[Commerce.Age Range]');
  });

  it('fills only the target panel for a measure-column target comparison', () => {
    const panels = toKpiPanels({
      value: sumRevenue,
      comparison: { type: 'target', target: sumCost },
    });

    expect(panels[2].items).toHaveLength(1);
    expect((panels[2].items[0].jaql as { agg?: string }).agg).toBe('sum');
    expect(panels[3].items).toEqual([]);
  });

  it('writes a literal-number target as a constant formula panel item', () => {
    // Fusion has no literal-number item; a fixed goal is a constant formula there, so that is
    // what a number serializes to. It comes back as a measure column, not a number.
    const panels = toKpiPanels({
      value: sumRevenue,
      comparison: { type: 'target', target: 10000 },
    });

    expect(panels[2].items).toEqual([{ jaql: { formula: '10000', title: '10000' } }]);
    expect(panels[3].items).toEqual([]);
  });

  it('leaves the target panel empty for a non-finite target, which has no formula form', () => {
    // Writing `{ formula: 'NaN' }` would build a panel the query engine rejects, so these fall
    // back to an empty target panel — and, via isSerializableKpiTarget, to a non-goal subtype.
    for (const target of [NaN, Infinity, -Infinity]) {
      const panels = toKpiPanels({
        value: sumRevenue,
        comparison: { type: 'target', target },
      });
      expect(panels.map((panel) => panel.name)).toEqual(manifestOrder);
      expect(panels[2].items).toEqual([]);
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
      expect(panels[2].items[0].jaql).toEqual({ formula, title: formula });
    }
  });

  it.each(['delta', 'value'] as const)(
    'fills only the comparisonValue panel for a %s comparison',
    (type) => {
      const panels = toKpiPanels({ value: sumRevenue, comparison: { type, value: sumCost } });

      expect(panels[2].items).toEqual([]);
      expect(panels[3].items).toHaveLength(1);
      expect((panels[3].items[0].jaql as { agg?: string }).agg).toBe('sum');
    },
  );

  it('leaves both comparison panels empty for previous-period (the subtype carries it)', () => {
    const panels = toKpiPanels({
      value: sumRevenue,
      category: Commerce.AgeRange,
      comparison: { type: 'previous-period' },
    });

    expect(panels[2].items).toEqual([]);
    expect(panels[3].items).toEqual([]);
  });
});
