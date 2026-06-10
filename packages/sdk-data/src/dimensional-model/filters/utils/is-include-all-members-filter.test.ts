import { describe, expect, it } from 'vitest';

import { DimensionalAttribute } from '../../attributes/attributes.js';
import * as filterFactory from '../factory.js';
import { ExcludeFilter, MembersFilter, NumericFilter } from '../filters.js';
import { isIncludeAllMembersFilter } from './is-include-all-members-filter.js';

describe('isIncludeAllMembersFilter', () => {
  const attribute = new DimensionalAttribute('Category', '[Category.Category]', 'text-attribute');

  it('returns true for a members filter with no members', () => {
    const filter = filterFactory.members(attribute, []);
    expect(isIncludeAllMembersFilter(filter)).toBe(true);
  });

  it('returns false for a members filter with members', () => {
    const filter = filterFactory.members(attribute, ['Cell Phones']);
    expect(isIncludeAllMembersFilter(filter)).toBe(false);
  });

  it('returns true for an exclude-mode members filter when empty (also a no-op)', () => {
    const filter = new MembersFilter(attribute, [], { excludeMembers: true });
    expect(isIncludeAllMembersFilter(filter)).toBe(true);
  });

  it('returns false for an ExcludeFilter wrapping an empty members filter', () => {
    const inner = new MembersFilter(attribute, []);
    const filter = new ExcludeFilter(inner);
    expect(isIncludeAllMembersFilter(filter)).toBe(false);
  });

  it('returns false for a non-members filter', () => {
    const filter = new NumericFilter(attribute, 'numericGreaterThan', 0);
    expect(isIncludeAllMembersFilter(filter)).toBe(false);
  });

  it('returns true even when the members filter is disabled', () => {
    const filter = new MembersFilter(attribute, [], { disabled: true });
    expect(isIncludeAllMembersFilter(filter)).toBe(true);
  });
});
