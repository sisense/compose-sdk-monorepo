import { measureFactory } from '@sisense/sdk-data';

import { Commerce } from '@/__test-helpers__/sample-ecommerce';
import type { GenericDataOptions } from '@/types';

import { toCustomWidgetPanels } from './to-widget-dto-panels';

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
