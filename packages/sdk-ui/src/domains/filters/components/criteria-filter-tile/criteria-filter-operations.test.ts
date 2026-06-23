import { describe, expect, it } from 'vitest';

import { FilterOption, getRankingTypeLabel } from './criteria-filter-operations.js';

const t = ((key: string) => {
  const translations: Record<string, string> = {
    'filterEditor.conditions.top': 'Top',
    'filterEditor.conditions.bottom': 'Bottom',
  };
  return translations[key] ?? key;
}) as Parameters<typeof getRankingTypeLabel>[1];

describe('criteria-filter-operations', () => {
  it('returns Top label for top ranking filter type', () => {
    expect(getRankingTypeLabel(FilterOption.TOP as never, t)).toBe('Top');
  });

  it('returns Bottom label for bottom ranking filter type', () => {
    expect(getRankingTypeLabel(FilterOption.BOTTOM as never, t)).toBe('Bottom');
  });
});
