import { describe, expect, it } from 'vitest';

import { filterWidgetFilterTypeLabels } from './types.js';

describe('filterWidgetFilterTypeLabels', () => {
  it('maps every filter type to a human-readable label', () => {
    expect(filterWidgetFilterTypeLabels).toEqual({
      members: 'List',
      dateRange: 'Date Range',
      period: 'Period',
      numericRange: 'Numeric Range',
      condition: 'Condition',
    });
  });
});
