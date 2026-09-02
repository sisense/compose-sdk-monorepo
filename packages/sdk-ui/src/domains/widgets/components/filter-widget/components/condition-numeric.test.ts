import {
  createAttribute,
  filterFactory,
  isLogicalAttributeFilter,
  isNumericFilter,
  LogicalAttributeFilter,
  LogicalOperators,
  measureFactory,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  defaultNumericConditionDraft,
  describeNumericCondition,
  filterToNumericConditionDraft,
  isEditableNumericConditionFilter,
  isNumericConditionComplete,
  isNumericConditionPrimaryFilled,
  numericConditionToFilter,
  summariseNumericCondition,
} from './condition-numeric.js';

const attr = createAttribute({
  name: 'Revenue',
  expression: '[Commerce.Revenue]',
  type: 'numeric',
});
const labelOf = (op: string) => op;

describe('condition-numeric', () => {
  it('defaults to equals with empty operands and no chain', () => {
    expect(defaultNumericConditionDraft()).toEqual({
      op: 'equals',
      number: '',
      min: '',
      max: '',
      connector: 'AND',
      extra: [],
    });
    expect(isNumericConditionComplete(defaultNumericConditionDraft())).toBe(false);
  });

  it('requires decimal/scientific operands for a complete condition (rejects hex and empty)', () => {
    expect(isNumericConditionComplete(defaultNumericConditionDraft())).toBe(false);
    expect(
      isNumericConditionComplete({
        op: 'equals',
        number: '250355.07',
        min: '',
        max: '',
        connector: 'AND',
        extra: [],
      }),
    ).toBe(true);
    expect(
      isNumericConditionComplete({
        op: 'equals',
        number: '0x10',
        min: '',
        max: '',
        connector: 'AND',
        extra: [],
      }),
    ).toBe(false);
    expect(
      isNumericConditionComplete({
        op: 'equals',
        number: 'mkk',
        min: '',
        max: '',
        connector: 'AND',
        extra: [],
      }),
    ).toBe(false);
  });

  it('summarises a complete numeric condition and withholds incomplete ones', () => {
    expect(
      summariseNumericCondition(
        { op: 'equals', number: '', min: '', max: '', connector: 'AND', extra: [] },
        labelOf,
      ),
    ).toBeUndefined();
    expect(
      summariseNumericCondition(
        { op: 'gt', number: '100', min: '', max: '', connector: 'AND', extra: [] },
        labelOf,
      ),
    ).toBe('gt 100');
    expect(
      summariseNumericCondition(
        { op: 'between', number: '', min: '10', max: '20', connector: 'AND', extra: [] },
        labelOf,
      ),
    ).toBe('between 10 – 20');
  });

  it('strips comparison glyphs from the closed-trigger sentence', () => {
    const labelWithGlyph = (op: string) => {
      const glyphs: Record<string, string | undefined> = { equals: '=', lte: '≤', gte: '≥' };
      const glyph = glyphs[op];
      return glyph ? `${glyph} ${op}` : op;
    };
    expect(
      summariseNumericCondition(
        { op: 'equals', number: '5', min: '', max: '', connector: 'AND', extra: [] },
        labelWithGlyph,
      ),
    ).toBe('equals 5');
    expect(
      summariseNumericCondition(
        {
          op: 'lte',
          number: '5000',
          min: '',
          max: '',
          connector: 'AND',
          extra: [{ id: 'a', op: 'gte', number: '2' }],
        },
        labelWithGlyph,
      ),
    ).toBe('lte 5000 AND gte 2');
  });

  it('round-trips equals through NumericFilter', () => {
    const filter = numericConditionToFilter(attr, {
      op: 'equals',
      number: '1000',
      min: '',
      max: '',
      connector: 'AND',
      extra: [],
    });
    expect(isNumericFilter(filter)).toBe(true);
    expect(filter.filterJaql()).toMatchObject({ equals: 1000 });
    expect(filterToNumericConditionDraft(filter)).toEqual({
      op: 'equals',
      number: '1000',
      min: '',
      max: '',
      connector: 'AND',
      extra: [],
    });
  });

  it('round-trips between through NumericFilter / JAQL', () => {
    const filter = numericConditionToFilter(attr, {
      op: 'between',
      number: '',
      min: '250355.07',
      max: '1299872.28',
      connector: 'AND',
      extra: [],
    });
    expect(isNumericFilter(filter)).toBe(true);
    expect(filter.filterJaql()).toMatchObject({ from: 250355.07, to: 1299872.28 });

    expect(filterToNumericConditionDraft(filter)).toEqual({
      op: 'between',
      number: '',
      min: '250355.07',
      max: '1299872.28',
      connector: 'AND',
      extra: [],
    });
  });

  it('seeds the default draft from a members filter', () => {
    const members = filterFactory.members(attr, ['100']);
    expect(filterToNumericConditionDraft(members)).toEqual(defaultNumericConditionDraft());
  });

  it('requires every chained row before the filter is complete', () => {
    const incomplete = {
      op: 'gt' as const,
      number: '100',
      min: '',
      max: '',
      connector: 'AND' as const,
      extra: [{ id: 'a', op: 'lt' as const, number: '' }],
    };
    expect(isNumericConditionPrimaryFilled(incomplete)).toBe(true);
    expect(isNumericConditionComplete(incomplete)).toBe(false);

    const complete = {
      ...incomplete,
      extra: [{ id: 'a', op: 'lt' as const, number: '500' }],
    };
    expect(isNumericConditionComplete(complete)).toBe(true);
    expect(describeNumericCondition(complete, labelOf)).toEqual(['gt 100', 'AND lt 500']);
    expect(summariseNumericCondition(complete, labelOf)).toBe('gt 100 AND lt 500');
  });

  it('rejects non-numeric operands as incomplete', () => {
    expect(
      isNumericConditionComplete({
        op: 'gt',
        number: 'abc',
        min: '',
        max: '',
        connector: 'AND',
        extra: [],
      }),
    ).toBe(false);
    expect(
      isNumericConditionComplete({
        op: 'between',
        number: '',
        min: '10',
        max: 'x',
        connector: 'AND',
        extra: [],
      }),
    ).toBe(false);
    expect(
      isNumericConditionComplete({
        op: 'gt',
        number: '100',
        min: '',
        max: '',
        connector: 'AND',
        extra: [{ id: 'a', op: 'lt', number: 'mkk' }],
      }),
    ).toBe(false);
  });

  it('round-trips an AND chain through LogicalAttributeFilter / JAQL', () => {
    const draft = {
      op: 'gt' as const,
      number: '100',
      min: '',
      max: '',
      connector: 'AND' as const,
      extra: [{ id: 'r1', op: 'lt' as const, number: '500' }],
    };
    const filter = numericConditionToFilter(attr, draft);
    expect(isLogicalAttributeFilter(filter)).toBe(true);
    expect(filter.filterJaql()).toEqual({
      and: [{ fromNotEqual: 100 }, { toNotEqual: 500 }],
    });

    const back = filterToNumericConditionDraft(filter);
    expect(back.op).toBe('gt');
    expect(back.number).toBe('100');
    expect(back.connector).toBe('AND');
    expect(back.extra).toHaveLength(1);
    expect(back.extra[0]).toMatchObject({ op: 'lt', number: '500' });
  });

  it('round-trips an OR chain through union JAQL', () => {
    const draft = {
      op: 'equals' as const,
      number: '10',
      min: '',
      max: '',
      connector: 'OR' as const,
      extra: [
        { id: 'r1', op: 'gte' as const, number: '100' },
        { id: 'r2', op: 'lte' as const, number: '5' },
      ],
    };
    const filter = numericConditionToFilter(attr, draft);
    expect(filter.filterJaql()).toEqual({
      or: [{ equals: 10 }, { from: 100 }, { to: 5 }],
    });

    const back = filterToNumericConditionDraft(filter);
    expect(back.connector).toBe('OR');
    expect(back.extra).toHaveLength(2);
    expect(back.extra[0]).toMatchObject({ op: 'gte', number: '100' });
    expect(back.extra[1]).toMatchObject({ op: 'lte', number: '5' });
  });

  it('rejects nested logical children as not editable', () => {
    const nested = filterFactory.intersection([
      filterFactory.greaterThan(attr, 100),
      filterFactory.intersection([
        filterFactory.greaterThan(attr, 200),
        filterFactory.lessThan(attr, 500),
      ]),
    ]);
    expect(isEditableNumericConditionFilter(nested)).toBe(false);
    expect(filterToNumericConditionDraft(nested)).toEqual(defaultNumericConditionDraft());
  });

  it('rejects mixed-attribute logical chains (Apply would rewrite all leaves)', () => {
    const cost = createAttribute({
      name: 'Cost',
      expression: '[Commerce.Cost]',
      type: 'numeric',
    });
    const mixedAttrs = filterFactory.intersection([
      filterFactory.greaterThan(attr, 100),
      filterFactory.lessThan(cost, 50),
    ]);
    expect(isEditableNumericConditionFilter(mixedAttrs)).toBe(false);
    expect(filterToNumericConditionDraft(mixedAttrs)).toEqual(defaultNumericConditionDraft());
  });

  it('rejects a between leaf that is not the primary in a logical chain', () => {
    const mixed = filterFactory.intersection([
      filterFactory.greaterThan(attr, 100),
      filterFactory.between(attr, 1, 5),
    ]);
    expect(isEditableNumericConditionFilter(mixed)).toBe(false);
    expect(filterToNumericConditionDraft(mixed)).toEqual(defaultNumericConditionDraft());
  });

  it('rejects between as the primary of a logical chain (Between is primary-only, no AND/OR)', () => {
    const betweenThenGt = filterFactory.intersection([
      filterFactory.between(attr, 1, 5),
      filterFactory.greaterThan(attr, 100),
    ]);
    expect(isEditableNumericConditionFilter(betweenThenGt)).toBe(false);
    expect(filterToNumericConditionDraft(betweenThenGt)).toEqual(defaultNumericConditionDraft());
  });

  it('still treats between as editable when it is the sole primary leaf', () => {
    const between = filterFactory.between(attr, 1, 5);
    expect(isEditableNumericConditionFilter(between)).toBe(true);
    expect(filterToNumericConditionDraft(between)).toMatchObject({
      op: 'between',
      min: '1',
      max: '5',
      extra: [],
    });
  });

  it('rejects unsupported logical operators instead of coercing them to AND', () => {
    const exclude = new LogicalAttributeFilter(
      [filterFactory.greaterThan(attr, 100)],
      LogicalOperators.Exclude,
    );
    expect(isEditableNumericConditionFilter(exclude)).toBe(false);
    expect(filterToNumericConditionDraft(exclude)).toEqual(defaultNumericConditionDraft());
  });

  it('rejects ranking filters such as top', () => {
    const top = filterFactory.topRanking(attr, measureFactory.sum(attr), 10);
    expect(isEditableNumericConditionFilter(top)).toBe(false);
    expect(filterToNumericConditionDraft(top)).toEqual(defaultNumericConditionDraft());
  });

  it('rejects text filters', () => {
    const text = filterFactory.contains(
      createAttribute({ name: 'Country', expression: '[Commerce.Country]', type: 'text' }),
      'x',
    );
    expect(isEditableNumericConditionFilter(text)).toBe(false);
    expect(filterToNumericConditionDraft(text)).toEqual(defaultNumericConditionDraft());
  });

  it('rejects a numeric filter with a missing operand', () => {
    const malformed = filterFactory.greaterThan(attr, 100);
    // Filter does not expose valueA; cast so we can strip it and simulate a malformed linked filter.
    delete (malformed as { valueA?: number }).valueA;
    expect(isEditableNumericConditionFilter(malformed)).toBe(false);
    expect(filterToNumericConditionDraft(malformed)).toEqual(defaultNumericConditionDraft());
  });

  it('still treats equals with a value as editable', () => {
    const equals = filterFactory.equals(attr, 42);
    expect(isEditableNumericConditionFilter(equals)).toBe(true);
  });
});
