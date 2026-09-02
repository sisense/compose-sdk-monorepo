import {
  createAttribute,
  filterFactory,
  isLogicalAttributeFilter,
  isTextFilter,
  LogicalAttributeFilter,
  LogicalOperators,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  defaultTextConditionDraft,
  describeTextCondition,
  filterToTextConditionDraft,
  isEditableTextConditionFilter,
  isTextConditionComplete,
  isTextConditionPrimaryFilled,
  summariseTextCondition,
  textConditionToFilter,
} from './condition-text.js';

const attr = createAttribute({ name: 'Country', expression: '[Commerce.Country]', type: 'text' });
const labelOf = (op: string) => op;

describe('condition-text', () => {
  it('defaults to contains with an empty value and no chain', () => {
    expect(defaultTextConditionDraft()).toEqual({
      op: 'contains',
      text: '',
      connector: 'AND',
      extra: [],
    });
    expect(isTextConditionComplete(defaultTextConditionDraft())).toBe(false);
  });

  it('treats empty / not-empty as complete without text', () => {
    expect(isTextConditionComplete({ op: 'empty', text: '', connector: 'AND', extra: [] })).toBe(
      true,
    );
    expect(
      isTextConditionComplete({ op: 'not-empty', text: '', connector: 'AND', extra: [] }),
    ).toBe(true);
  });

  it('summarises a complete text condition and withholds incomplete ones', () => {
    expect(
      summariseTextCondition({ op: 'contains', text: '', connector: 'AND', extra: [] }, labelOf),
    ).toBeUndefined();
    expect(
      summariseTextCondition(
        { op: 'contains', text: 'cardio', connector: 'AND', extra: [] },
        labelOf,
      ),
    ).toBe('contains cardio');
    expect(
      summariseTextCondition({ op: 'empty', text: '', connector: 'AND', extra: [] }, labelOf),
    ).toBe('empty');
  });

  it('round-trips contains through Filter', () => {
    const filter = textConditionToFilter(attr, {
      op: 'contains',
      text: 'FR',
      connector: 'AND',
      extra: [],
    });
    expect(isTextFilter(filter)).toBe(true);
    expect(filterToTextConditionDraft(filter)).toEqual({
      op: 'contains',
      text: 'FR',
      connector: 'AND',
      extra: [],
    });
  });

  it('round-trips is-empty / is-not-empty as equals/doesntEqual empty string', () => {
    const empty = textConditionToFilter(attr, {
      op: 'empty',
      text: '',
      connector: 'AND',
      extra: [],
    });
    expect(filterToTextConditionDraft(empty)).toEqual({
      op: 'empty',
      text: '',
      connector: 'AND',
      extra: [],
    });

    const notEmpty = textConditionToFilter(attr, {
      op: 'not-empty',
      text: '',
      connector: 'AND',
      extra: [],
    });
    expect(filterToTextConditionDraft(notEmpty)).toEqual({
      op: 'not-empty',
      text: '',
      connector: 'AND',
      extra: [],
    });
  });

  it('seeds the default draft from a members filter', () => {
    const members = filterFactory.members(attr, ['France']);
    expect(filterToTextConditionDraft(members)).toEqual(defaultTextConditionDraft());
  });

  it('requires every chained row before the filter is complete', () => {
    const incomplete = {
      op: 'contains' as const,
      text: 'cardio',
      connector: 'AND' as const,
      extra: [{ id: 'a', op: 'ends-with' as const, text: '' }],
    };
    expect(isTextConditionPrimaryFilled(incomplete)).toBe(true);
    expect(isTextConditionComplete(incomplete)).toBe(false);

    const complete = {
      ...incomplete,
      extra: [{ id: 'a', op: 'ends-with' as const, text: 'ology' }],
    };
    expect(isTextConditionComplete(complete)).toBe(true);
    expect(describeTextCondition(complete, labelOf)).toEqual([
      'contains cardio',
      'AND ends-with ology',
    ]);
    expect(summariseTextCondition(complete, labelOf)).toBe('contains cardio AND ends-with ology');
  });

  it('round-trips an AND chain through LogicalAttributeFilter / JAQL', () => {
    const draft = {
      op: 'starts-with' as const,
      text: 'A',
      connector: 'AND' as const,
      extra: [{ id: 'r1', op: 'ends-with' as const, text: 's' }],
    };
    const filter = textConditionToFilter(attr, draft);
    expect(isLogicalAttributeFilter(filter)).toBe(true);
    expect(filter.filterJaql()).toEqual({
      and: [{ startsWith: 'A' }, { endsWith: 's' }],
    });

    const back = filterToTextConditionDraft(filter);
    expect(back.op).toBe('starts-with');
    expect(back.text).toBe('A');
    expect(back.connector).toBe('AND');
    expect(back.extra).toHaveLength(1);
    expect(back.extra[0]).toMatchObject({ op: 'ends-with', text: 's' });
  });

  it('round-trips an OR chain through union JAQL', () => {
    const draft = {
      op: 'contains' as const,
      text: 'x',
      connector: 'OR' as const,
      extra: [
        { id: 'r1', op: 'empty' as const, text: '' },
        { id: 'r2', op: 'equals' as const, text: 'y' },
      ],
    };
    const filter = textConditionToFilter(attr, draft);
    expect(filter.filterJaql()).toEqual({
      or: [{ contains: 'x' }, { equals: '' }, { equals: 'y' }],
    });

    const back = filterToTextConditionDraft(filter);
    expect(back.connector).toBe('OR');
    expect(back.extra).toHaveLength(2);
    expect(back.extra[0].op).toBe('empty');
    expect(back.extra[1]).toMatchObject({ op: 'equals', text: 'y' });
  });

  it('uses draft.connector for every chained row when publishing', () => {
    const draft = {
      op: 'contains' as const,
      text: 'x',
      connector: 'OR' as const,
      extra: [
        { id: 'r1', op: 'equals' as const, text: 'y' },
        { id: 'r2', op: 'ends-with' as const, text: 'z' },
      ],
    };
    const filter = textConditionToFilter(attr, draft);
    expect(filter.filterJaql()).toEqual({
      or: [{ contains: 'x' }, { equals: 'y' }, { endsWith: 'z' }],
    });
  });

  it('rejects nested logical children as not editable', () => {
    const nested = filterFactory.intersection([
      filterFactory.contains(attr, 'a'),
      filterFactory.intersection([
        filterFactory.contains(attr, 'b'),
        filterFactory.contains(attr, 'c'),
      ]),
    ]);
    expect(isEditableTextConditionFilter(nested)).toBe(false);
    expect(filterToTextConditionDraft(nested)).toEqual(defaultTextConditionDraft());
  });

  it('rejects mixed-attribute logical chains (Apply would rewrite all leaves)', () => {
    const brand = createAttribute({
      name: 'Brand',
      expression: '[Commerce.Brand]',
      type: 'text',
    });
    const mixedAttrs = filterFactory.intersection([
      filterFactory.contains(attr, 'a'),
      filterFactory.contains(brand, 'b'),
    ]);
    expect(isEditableTextConditionFilter(mixedAttrs)).toBe(false);
    expect(filterToTextConditionDraft(mixedAttrs)).toEqual(defaultTextConditionDraft());
  });

  it('rejects unsupported logical operators instead of coercing them to AND', () => {
    const exclude = new LogicalAttributeFilter(
      [filterFactory.contains(attr, 'x')],
      LogicalOperators.Exclude,
    );
    expect(isEditableTextConditionFilter(exclude)).toBe(false);
    expect(filterToTextConditionDraft(exclude)).toEqual(defaultTextConditionDraft());
  });

  it('rejects unsupported text operators such as like', () => {
    const like = filterFactory.like(attr, '%x%');
    expect(isEditableTextConditionFilter(like)).toBe(false);
    expect(filterToTextConditionDraft(like)).toEqual(defaultTextConditionDraft());
  });

  it('rejects a text filter with a missing operand', () => {
    const malformed = filterFactory.contains(attr, 'x');
    // Filter does not expose valueA; cast so we can strip it and simulate a malformed linked filter.
    delete (malformed as { valueA?: string }).valueA;
    expect(isEditableTextConditionFilter(malformed)).toBe(false);
    expect(filterToTextConditionDraft(malformed)).toEqual(defaultTextConditionDraft());
  });

  it('still treats equals with a value as editable', () => {
    const equals = filterFactory.equals(attr, 'foo');
    expect(isEditableTextConditionFilter(equals)).toBe(true);
  });
});
