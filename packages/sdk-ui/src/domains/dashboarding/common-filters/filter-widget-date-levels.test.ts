import { Attribute, createAttribute, Filter, filterFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';

import { withExcludedDateLevels } from './filter-widget-date-levels.js';

const textAttr = createAttribute({
  name: 'Country',
  expression: '[Country.Country]',
  type: 'text',
});

// The runtime guard only checks `widgetType === 'filter'`, so a minimal shape is enough.
const filterWidget = (attribute: Attribute, filter?: Filter): WidgetProps => ({
  id: 'filter-widget',
  widgetType: 'filter',
  attribute,
  filter,
});

describe('withExcludedDateLevels', () => {
  it('passes non-filter widgets through unchanged', () => {
    const widget = { widgetType: 'chart' } as unknown as WidgetProps;
    expect(withExcludedDateLevels([])(widget)).toBe(widget);
  });

  it('leaves a FilterWidget untouched when there are no active filters', () => {
    const widget = filterWidget(DM.Commerce.Date.Years);
    expect(withExcludedDateLevels([])(widget)).toBe(widget);
  });

  it('excludes granularities claimed by other date-level filters on the same dimension', () => {
    const yearsFilter = filterFactory.members(DM.Commerce.Date.Years, []);
    const monthsFilter = filterFactory.members(DM.Commerce.Date.Months, []);
    // No linked `widget.filter`, so the own granularity falls back to `widget.attribute`.
    const widget = filterWidget(DM.Commerce.Date.Years);

    const result = withExcludedDateLevels([yearsFilter, monthsFilter])(widget);

    expect(result).not.toBe(widget);
    // Years is the widget's own level (retained); only Months is hidden.
    expect(result).toMatchObject({ excludedDateLevels: ['Months'] });
  });

  it('never excludes the granularity the widget itself owns', () => {
    const yearsFilter = filterFactory.members(DM.Commerce.Date.Years, []);
    const widget = filterWidget(DM.Commerce.Date.Years, yearsFilter);

    // The only active level filter is the widget's own — nothing to hide.
    expect(withExcludedDateLevels([yearsFilter])(widget)).toBe(widget);
  });

  it('ignores level filters belonging to a different dimension', () => {
    const monthsFilter = filterFactory.members(DM.Commerce.Date.Months, []);
    const widget = filterWidget(textAttr);

    expect(withExcludedDateLevels([monthsFilter])(widget)).toBe(widget);
  });
});
