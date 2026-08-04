import { createFilterFromJaql, Filter } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  getConfigWithUpdatedDeactivated,
  getMembersWithDeactivated,
  getMembersWithoutDeactivated,
} from './utils.js';

/**
 * Builds a members filter from JAQL the way a dashboard filter arrives. Members are kept verbatim,
 * so numeric JAQL members stay numbers at runtime despite the `string[]` type.
 */
function createMembersFilterFromJaql(members: unknown[], deactivated?: unknown[]): Filter {
  return createFilterFromJaql({
    title: 'Revenue',
    dim: '[Commerce.Revenue]',
    datatype: 'numeric',
    filter: deactivated
      ? {
          members: [...members, ...deactivated],
          filter: { turnedOff: true, exclude: { members: deactivated } },
        }
      : { members },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw dashboard filter JAQL has no public type
  } as any);
}

describe('filter-editor-popover sections utils', () => {
  describe('getMembersWithDeactivated', () => {
    it('returns numeric JAQL members as strings', () => {
      const filter = createMembersFilterFromJaql([4, 18]);

      // guards the premise: the filter really does hold numbers
      expect((filter as unknown as { members: unknown[] }).members).toEqual([4, 18]);
      expect(getMembersWithDeactivated(filter)).toEqual(['4', '18']);
    });

    it('leaves string members untouched', () => {
      expect(getMembersWithDeactivated(createMembersFilterFromJaql(['0-18']))).toEqual(['0-18']);
    });
  });

  it('excludes numeric deactivated members from the written-back members', () => {
    const filter = createMembersFilterFromJaql([4], [18]);

    expect(getMembersWithoutDeactivated(filter, ['4', '18'])).toEqual(['4']);
  });

  it('keeps numeric deactivated members that are still selected', () => {
    const filter = createMembersFilterFromJaql([4], [18]);

    expect(getConfigWithUpdatedDeactivated(filter, ['4', '18'])).toMatchObject({
      deactivatedMembers: ['18'],
    });
  });
});
