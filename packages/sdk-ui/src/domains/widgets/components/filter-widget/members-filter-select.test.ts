import { describe, expect, it } from 'vitest';

import { getMembersFilterSelectTriggerLabel } from './members-filter-select.js';

const formatSelectedCount = (count: number) => `${count} selected`;
const formatAllExceptCount = (count: number) => `All except ${count}`;

describe('getMembersFilterSelectTriggerLabel', () => {
  it('shows include-all for select-all when total count is unknown', () => {
    expect(
      getMembersFilterSelectTriggerLabel(
        [],
        true,
        'Set filter',
        'Include all',
        formatSelectedCount,
        formatAllExceptCount,
      ),
    ).toBe('Include all');
  });

  it('shows "N selected" for select-all when total count is known', () => {
    expect(
      getMembersFilterSelectTriggerLabel(
        [],
        true,
        'Set filter',
        'Include all',
        formatSelectedCount,
        formatAllExceptCount,
        248,
      ),
    ).toBe('248 selected');
  });

  it('shows placeholder for clear / empty include', () => {
    expect(
      getMembersFilterSelectTriggerLabel(
        [],
        false,
        'Set filter',
        'Include all',
        formatSelectedCount,
        formatAllExceptCount,
      ),
    ).toBe('Set filter');
  });

  it('joins selected member titles', () => {
    expect(
      getMembersFilterSelectTriggerLabel(
        [
          { key: 'France', title: 'France' },
          { key: 'Italy', title: 'Italy' },
        ],
        false,
        'Set filter',
        'Include all',
        formatSelectedCount,
        formatAllExceptCount,
      ),
    ).toBe('France, Italy');
  });

  it('shows remaining count in exclude mode (not exclusion titles)', () => {
    expect(
      getMembersFilterSelectTriggerLabel(
        [
          { key: 'France', title: 'France' },
          { key: 'Italy', title: 'Italy' },
        ],
        true,
        'Set filter',
        'Include all',
        formatSelectedCount,
        formatAllExceptCount,
        248,
      ),
    ).toBe('246 selected');
  });

  it('shows "All except N" for exclusions when total is unknown', () => {
    expect(
      getMembersFilterSelectTriggerLabel(
        [
          { key: 'France', title: 'France' },
          { key: 'Italy', title: 'Italy' },
        ],
        true,
        'Set filter',
        'Include all',
        formatSelectedCount,
        formatAllExceptCount,
      ),
    ).toBe('All except 2');
  });

  it('shows "N selected" when more than three members are selected', () => {
    expect(
      getMembersFilterSelectTriggerLabel(
        [
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
          { key: 'c', title: 'C' },
          { key: 'd', title: 'D' },
        ],
        false,
        'Set filter',
        'Include all',
        formatSelectedCount,
        formatAllExceptCount,
      ),
    ).toBe('4 selected');
  });

  it('joins exactly three member titles', () => {
    expect(
      getMembersFilterSelectTriggerLabel(
        [
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
          { key: 'c', title: 'C' },
        ],
        false,
        'Set filter',
        'Include all',
        formatSelectedCount,
        formatAllExceptCount,
      ),
    ).toBe('A, B, C');
  });
});
