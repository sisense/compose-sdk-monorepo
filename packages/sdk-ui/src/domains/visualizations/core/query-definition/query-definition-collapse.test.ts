import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MAX_VISIBLE_PILLS,
  selectVisiblePillIndexes,
  splitCollapsedView,
} from './query-definition-collapse';
import type { QueryDefinitionViewModel } from './types';

function pills(labels: { label: string; pin?: boolean }[]): QueryDefinitionViewModel {
  return labels.flatMap((item, i) => {
    const pill = {
      type: 'pill' as const,
      label: item.label,
      category: 'dimension' as const,
      pin: item.pin,
      id: `${i}`,
    };
    if (i === 0) {
      return [pill];
    }
    return [{ type: 'connector' as const, label: 'by' }, pill];
  });
}

describe('selectVisiblePillIndexes', () => {
  it('fills remaining slots with unpinned pills after pinned ones', () => {
    const view = pills([
      { label: 'A' },
      { label: 'B' },
      { label: 'C' },
      { label: 'D' },
      { label: 'E', pin: true },
    ]);
    const selected = selectVisiblePillIndexes(view, 4);
    const labels = [...selected]
      .sort((a, b) => a - b)
      .map((index) => {
        const item = view[index];
        return item.type === 'pill' ? item.label : '';
      });
    expect(labels).toEqual(['A', 'B', 'C', 'E']);
  });

  it('caps pinned pills at the visible limit', () => {
    const view = pills([
      { label: 'A', pin: true },
      { label: 'B', pin: true },
      { label: 'C', pin: true },
      { label: 'D', pin: true },
      { label: 'E', pin: true },
    ]);
    expect(selectVisiblePillIndexes(view, 3).size).toBe(3);
  });
});

describe('splitCollapsedView', () => {
  it('keeps a trailing pinned pill visible and reports hidden count', () => {
    const view = pills([
      { label: 'A' },
      { label: 'B' },
      { label: 'C' },
      { label: 'D' },
      { label: 'Dashboard Filters', pin: true },
    ]);
    const { visible, moreCount } = splitCollapsedView(view);
    expect(visible.map((item) => item.label)).toEqual([
      'A',
      'by',
      'B',
      'by',
      'C',
      'by',
      'Dashboard Filters',
    ]);
    expect(moreCount).toBe(1);
    expect(DEFAULT_MAX_VISIBLE_PILLS).toBe(4);
  });

  it('honors an explicit maxVisible smaller than the default', () => {
    const view = pills([{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }]);
    const { visible, moreCount } = splitCollapsedView(view, 2);
    expect(visible.map((item) => item.label)).toEqual(['A', 'by', 'B']);
    expect(moreCount).toBe(2);
  });
});
