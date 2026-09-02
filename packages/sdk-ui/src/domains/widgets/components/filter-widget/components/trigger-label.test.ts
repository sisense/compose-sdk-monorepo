import { describe, expect, it } from 'vitest';

import { getMembersFilterSelectTriggerLabel } from './trigger-label.js';
import type { MembersTriggerLabelInput } from './trigger-label.js';

const formatSelectedCount = (count: number) => `${count} selected`;
const formatAllExceptCount = (count: number) => `All except ${count}`;

// The parts every case shares. Each test states only what it is actually about — the
// selection, the mode, and the total when it has one.
const label = (input: Partial<MembersTriggerLabelInput>) =>
  getMembersFilterSelectTriggerLabel({
    selectedMembers: [],
    excludeMembers: false,
    placeholder: 'Set filter',
    includeAllLabel: 'Include all',
    formatSelectedCount,
    formatAllExceptCount,
    ...input,
  });

describe('getMembersFilterSelectTriggerLabel', () => {
  it('shows include-all for select-all when total count is unknown', () => {
    expect(label({ excludeMembers: true })).toBe('Include all');
  });

  // Changed deliberately: this used to read "248 selected". Excluding nothing is a filter on
  // everything, and reporting the total as a count made the widget contradict its own linked
  // panel tile, which reads "Include all" for this state.
  it('shows include-all for select-all even when the total is known', () => {
    expect(label({ excludeMembers: true, totalMembersCount: 248 })).toBe('Include all');
  });

  it('still counts the remainder when exclusions exist and the total is known', () => {
    expect(
      label({
        selectedMembers: [{ key: 'France', title: 'France' }],
        excludeMembers: true,
        totalMembersCount: 248,
      }),
    ).toBe('247 selected');
  });

  it('shows placeholder for clear / empty include', () => {
    expect(label({})).toBe('Set filter');
  });

  it('joins selected member titles', () => {
    expect(
      label({
        selectedMembers: [
          { key: 'France', title: 'France' },
          { key: 'Italy', title: 'Italy' },
        ],
      }),
    ).toBe('France, Italy');
  });

  it('shows remaining count in exclude mode (not exclusion titles)', () => {
    expect(
      label({
        selectedMembers: [
          { key: 'France', title: 'France' },
          { key: 'Italy', title: 'Italy' },
        ],
        excludeMembers: true,
        totalMembersCount: 248,
      }),
    ).toBe('246 selected');
  });

  it('shows "All except N" for exclusions when total is unknown', () => {
    expect(
      label({
        selectedMembers: [
          { key: 'France', title: 'France' },
          { key: 'Italy', title: 'Italy' },
        ],
        excludeMembers: true,
      }),
    ).toBe('All except 2');
  });

  it('shows "N selected" when more than three members are selected', () => {
    expect(
      label({
        selectedMembers: [
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
          { key: 'c', title: 'C' },
          { key: 'd', title: 'D' },
        ],
      }),
    ).toBe('4 selected');
  });

  it('joins exactly three member titles', () => {
    expect(
      label({
        selectedMembers: [
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
          { key: 'c', title: 'C' },
        ],
      }),
    ).toBe('A, B, C');
  });

  // The include-mode presentation is delegated when asked, and only then — exclude mode has
  // no names to give, so a caller cannot reword it into reporting exclusions as selections.
  it('delegates the include-mode wording when a renderer is supplied', () => {
    expect(
      label({
        selectedMembers: [
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
          { key: 'c', title: 'C' },
          { key: 'd', title: 'D' },
        ],
        formatIncludedTitles: (titles) => `${titles[0]} +${titles.length - 1}`,
      }),
    ).toBe('A +3');
  });

  it('ignores the include-mode renderer in exclude mode', () => {
    expect(
      label({
        selectedMembers: [
          { key: 'France', title: 'France' },
          { key: 'Italy', title: 'Italy' },
        ],
        excludeMembers: true,
        formatIncludedTitles: () => 'should not be used',
      }),
    ).toBe('All except 2');
  });
});
