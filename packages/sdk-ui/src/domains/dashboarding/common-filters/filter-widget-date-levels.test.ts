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
    // No linked `widget.filter` — both active levels are someone else's, including Years
    // even though it matches the widget attribute (a new List must not sit on Condition's grain).
    const widget = filterWidget(DM.Commerce.Date.Years);

    const result = withExcludedDateLevels([yearsFilter, monthsFilter])(widget);

    expect(result).not.toBe(widget);
    expect(result).toMatchObject({ excludedDateLevels: ['Years', 'Months'] });
  });

  it('does not exclude the granularity of the widget’s own linked filter', () => {
    const yearsFilter = filterFactory.members(DM.Commerce.Date.Years, []);
    const monthsFilter = filterFactory.members(DM.Commerce.Date.Months, []);
    const widget = filterWidget(DM.Commerce.Date.Years, yearsFilter);

    const result = withExcludedDateLevels([yearsFilter, monthsFilter])(widget);

    expect(result).toMatchObject({ excludedDateLevels: ['Months'] });
  });

  it('leaves the widget untouched when the only level filter is its own', () => {
    const yearsFilter = filterFactory.members(DM.Commerce.Date.Years, []);
    const widget = filterWidget(DM.Commerce.Date.Years, yearsFilter);

    expect(withExcludedDateLevels([yearsFilter])(widget)).toBe(widget);
  });

  it('ignores level filters belonging to a different dimension', () => {
    const monthsFilter = filterFactory.members(DM.Commerce.Date.Months, []);
    const widget = filterWidget(textAttr);

    expect(withExcludedDateLevels([monthsFilter])(widget)).toBe(widget);
  });
});
