import { FilterJaql } from '../../types.js';
import { createFilterMatcher } from './filter-matcher-utils.js';

describe('createFilterMatcher', () => {
  describe('datetime members', () => {
    const datetimeMembersJaql = {
      datatype: 'datetime',
      filter: { members: ['2010-01-01T00:00:00'] },
    } as FilterJaql;

    it('matches a member on the same instant', () => {
      const filterMatcher = createFilterMatcher(datetimeMembersJaql);

      expect(filterMatcher('2010-01-01T00:00:00')).toBe(true);
      expect(filterMatcher('2011-01-01T00:00:00')).toBe(false);
    });

    /**
     * A pivot on a date dimension asks the matcher about every header cell, and a subtotal
     * caption is not a date. This used to throw `RangeError: Invalid time value` out of
     * `toISOString()` and take down the whole render.
     */
    it('does not match — and does not throw on — a value that is not a date at all', () => {
      const filterMatcher = createFilterMatcher(datetimeMembersJaql);

      expect(() => filterMatcher('Q1 2010 Total')).not.toThrow();
      expect(filterMatcher('Q1 2010 Total')).toBe(false);
      expect(filterMatcher('Grand Total')).toBe(false);
    });

    it('still matches an unparseable value against an equally unparseable member', () => {
      const filterMatcher = createFilterMatcher({
        datatype: 'datetime',
        filter: { members: ['Q1 2010 Total'] },
      } as FilterJaql);

      expect(filterMatcher('Q1 2010 Total')).toBe(true);
    });

    it('does not match one unparseable value against a different one', () => {
      const filterMatcher = createFilterMatcher({
        datatype: 'datetime',
        filter: { members: ['Grand Total'] },
      } as FilterJaql);

      expect(filterMatcher('Q1 2010 Total')).toBe(false);
    });
  });

  it('should create a filter matcher for specific items', () => {
    const membersFilterJaql = {
      datatype: 'text',
      filter: {
        members: ['item1', 'item2', 'item3'],
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(membersFilterJaql);
    expect(filterMatcher('item1')).toBe(true);
    expect(filterMatcher('item4')).toBe(false);
  });

  it('should create a filter matcher for excluding specific items', () => {
    const excludeMembersFilterJaql = {
      datatype: 'text',
      filter: {
        exclude: {
          members: ['exclude1', 'exclude2'],
        },
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(excludeMembersFilterJaql);

    expect(filterMatcher('exclude1')).toBe(false);
    expect(filterMatcher('exclude3')).toBe(true);
  });

  it('should create a text filter matcher for STARTS_WITH text condition', () => {
    const startWithFilterJaql = {
      datatype: 'text',
      filter: {
        startsWith: 'abc',
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(startWithFilterJaql);

    expect(filterMatcher('abcdef')).toBe(true);
    expect(filterMatcher('xyzabc')).toBe(false);
  });

  it('should create a text filter matcher for ENDS_WITH text condition', () => {
    const endsWithFilterJaql = {
      datatype: 'text',
      filter: {
        endsWith: 'abc',
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(endsWithFilterJaql);

    expect(filterMatcher('abcdef')).toBe(false);
    expect(filterMatcher('xyzabc')).toBe(true);
  });

  it('should create a text filter matcher for CONTAINS text condition', () => {
    const containsFilterJaql = {
      datatype: 'text',
      filter: {
        contains: 'abc',
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(containsFilterJaql);

    expect(filterMatcher('abcdef')).toBe(true);
    expect(filterMatcher('xyz')).toBe(false);
  });

  it('should create a filter matcher for EQUALS text condition', () => {
    const equalsFilterJaql = {
      datatype: 'text',
      filter: {
        equals: 'abc',
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(equalsFilterJaql);

    expect(filterMatcher('abc')).toBe(true);
    expect(filterMatcher('def')).toBe(false);
  });

  it('should create a text filter matcher for DOESNT_START_WITH text condition', () => {
    const doesntStartWithFilterJaql = {
      datatype: 'text',
      filter: {
        doesntStartWith: 'abc',
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(doesntStartWithFilterJaql);

    expect(filterMatcher('abcdef')).toBe(false);
    expect(filterMatcher('xyzabc')).toBe(true);
  });

  it('should create a text filter matcher for DOESNT_END_WITH text condition', () => {
    const doesntEndWithFilterJaql = {
      datatype: 'text',
      filter: {
        doesntEndWith: 'abc',
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(doesntEndWithFilterJaql);

    expect(filterMatcher('abcdef')).toBe(true);
    expect(filterMatcher('xyzabc')).toBe(false);
  });

  it('should create a text filter matcher for DOESNT_CONTAIN text condition', () => {
    const doesntContainFilterJaql = {
      datatype: 'text',
      filter: {
        doesntContain: 'abc',
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(doesntContainFilterJaql);

    expect(filterMatcher('abcdef')).toBe(false);
    expect(filterMatcher('xyz')).toBe(true);
  });

  it('should create a filter matcher for DOESNT_EQUAL text condition', () => {
    const doesntEqualFilterJaql = {
      datatype: 'text',
      filter: {
        doesntEqual: 'abc',
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(doesntEqualFilterJaql);

    expect(filterMatcher('abc')).toBe(false);
    expect(filterMatcher('def')).toBe(true);
  });

  it('should create a filter matcher for EQUALS numeric condition', () => {
    const equalsNumericFilterJaql = {
      datatype: 'numeric',
      filter: {
        equals: 10,
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(equalsNumericFilterJaql);

    expect(filterMatcher(10)).toBe(true);
    expect(filterMatcher(5)).toBe(false);
  });

  it('should create a filter matcher for DOESNT_EQUAL numeric condition', () => {
    const doesntEqualNumericFilterJaql = {
      datatype: 'numeric',
      filter: {
        doesntEqual: 10,
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(doesntEqualNumericFilterJaql);

    expect(filterMatcher(10)).toBe(false);
    expect(filterMatcher(5)).toBe(true);
  });

  it('should create a filter matcher for LESS_THAN numeric condition', () => {
    const lessThanNumericFilterJaql = {
      datatype: 'numeric',
      filter: {
        toNotEqual: 10,
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(lessThanNumericFilterJaql);

    expect(filterMatcher(5)).toBe(true);
    expect(filterMatcher(15)).toBe(false);
  });

  it('should create a filter matcher for GREATER_THAN numeric condition', () => {
    const greaterThanNumericFilterJaql = {
      datatype: 'numeric',
      filter: {
        fromNotEqual: 10,
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(greaterThanNumericFilterJaql);

    expect(filterMatcher(15)).toBe(true);
    expect(filterMatcher(5)).toBe(false);
  });

  it('should create a filter matcher for BETWEEN numeric condition', () => {
    const betweenNumericFilterJaql = {
      datatype: 'numeric',
      filter: {
        from: 5,
        to: 10,
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(betweenNumericFilterJaql);

    expect(filterMatcher(7)).toBe(true);
    expect(filterMatcher(3)).toBe(false);
    expect(filterMatcher(12)).toBe(false);
  });

  it('should create a filter matcher for GREATER_THAN_OR_EQUAL numeric condition', () => {
    const greaterThanOrEqualNumericFilterJaql = {
      datatype: 'numeric',
      filter: {
        from: 10,
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(greaterThanOrEqualNumericFilterJaql);

    expect(filterMatcher(15)).toBe(true);
    expect(filterMatcher(10)).toBe(true);
    expect(filterMatcher(5)).toBe(false);
  });

  it('should create a filter matcher for LESS_THAN_OR_EQUAL numeric condition', () => {
    const lessThanOrEqualNumericFilterJaql = {
      datatype: 'numeric',
      filter: {
        to: 10,
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(lessThanOrEqualNumericFilterJaql);

    expect(filterMatcher(5)).toBe(true);
    expect(filterMatcher(10)).toBe(true);
    expect(filterMatcher(15)).toBe(false);
  });

  it('should create a filter matcher for "AND" combined multiple condition filters', () => {
    const andCombinedFilterJaql = {
      datatype: 'numeric',
      filter: {
        and: [
          {
            toNotEqual: 10,
          },
          {
            fromNotEqual: 5,
          },
        ],
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(andCombinedFilterJaql);

    expect(filterMatcher(10)).toBe(false);
    expect(filterMatcher(7)).toBe(true);
    expect(filterMatcher(5)).toBe(false);
  });

  it('should create a filter matcher for "OR" combined multiple condition filters', () => {
    const orCombinedFilterJaql = {
      datatype: 'text',
      filter: {
        or: [
          {
            equals: 'apple',
          },
          {
            equals: 'banana',
          },
        ],
      },
    } as FilterJaql;

    const filterMatcher = createFilterMatcher(orCombinedFilterJaql);

    expect(filterMatcher('apple')).toBe(true);
    expect(filterMatcher('banana')).toBe(true);
    expect(filterMatcher('orange')).toBe(false);
  });
});
