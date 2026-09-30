import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model/types.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';

import { withNarrativeSiblings } from './with-narrative-siblings.js';

const chart = (id: string): WidgetProps => ({
  widgetType: 'chart',
  id,
  chartType: 'line',
  dataSource: DM.DataSource,
  dataOptions: {
    category: [DM.Commerce.Date.Months],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
  },
});
const narrative = (id: string): WidgetProps => ({ widgetType: 'narrative', id });
const text: WidgetProps = {
  widgetType: 'text',
  id: 't1',
  styleOptions: { html: '<p>x</p>', bgColor: '#fff', vAlign: 'valign-middle' },
};

const layout = (ids: (string | { id: string; hidden: true })[]): WidgetsPanelLayout => ({
  columns: [
    {
      widthPercentage: 100,
      rows: ids.map((entry) => ({
        cells:
          typeof entry === 'string'
            ? [{ widthPercentage: 100, widgetId: entry }]
            : [{ widthPercentage: 100, widgetId: entry.id, hidden: true }],
      })),
    },
  ],
});

function siblingsOf(widgets: readonly WidgetProps[], id: string): string[] {
  const widget = widgets.find((w) => w.id === id);
  return widget && 'widgets' in widget ? (widget.widgets ?? []).map((w) => w.id) : [];
}

describe('withNarrativeSiblings', () => {
  it('returns the input untouched when no narrative widget is present', () => {
    const widgets = [chart('c1'), text];

    expect(withNarrativeSiblings(layout(['c1', 't1']))(widgets)).toBe(widgets);
  });

  it('gives the narrative widget the other widgets in layout order', () => {
    const widgets = [chart('c1'), narrative('n1'), chart('c2'), text];

    const result = withNarrativeSiblings(layout(['n1', 'c2', 't1', 'c1']))(widgets);

    expect(siblingsOf(result, 'n1')).toEqual(['c2', 't1', 'c1']);
  });

  it('leaves out widgets hidden by the layout and widgets not in the layout', () => {
    const widgets = [chart('c1'), narrative('n1'), chart('c2'), chart('c3')];

    const result = withNarrativeSiblings(layout(['n1', 'c1', { id: 'c2', hidden: true }]))(widgets);

    expect(siblingsOf(result, 'n1')).toEqual(['c1']);
  });

  it('never lets narrative widgets describe each other', () => {
    const widgets = [narrative('n1'), narrative('n2'), chart('c1')];

    const result = withNarrativeSiblings(layout(['n1', 'n2', 'c1']))(widgets);

    expect(siblingsOf(result, 'n1')).toEqual(['c1']);
    expect(siblingsOf(result, 'n2')).toEqual(['c1']);
  });

  it('passes the connected props through by identity and leaves other widgets alone', () => {
    const c1 = chart('c1');
    const widgets = [c1, narrative('n1')];

    const result = withNarrativeSiblings(layout(['c1', 'n1']))(widgets);

    expect(result[0]).toBe(c1);
    const n1 = result[1];
    expect('widgets' in n1 && n1.widgets?.[0]).toBe(c1);
  });
});
