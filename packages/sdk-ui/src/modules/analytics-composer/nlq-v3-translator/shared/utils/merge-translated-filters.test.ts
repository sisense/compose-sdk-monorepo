import { createAttribute, filterFactory, isFilterRelations } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { mergeTranslatedFilters } from './merge-translated-filters.js';
import { asFilterRelations } from './translation-helpers.js';

const attributeA = createAttribute({ name: 'A', type: 'text-attribute', expression: '[A]' });
const attributeB = createAttribute({ name: 'B', type: 'text-attribute', expression: '[B]' });
const attributeC = createAttribute({ name: 'C', type: 'text-attribute', expression: '[C]' });
const attributeD = createAttribute({ name: 'D', type: 'text-attribute', expression: '[D]' });

const filterA = filterFactory.members(attributeA, ['a']);
const filterB = filterFactory.members(attributeB, ['b']);
const filterC = filterFactory.members(attributeC, ['c']);
const filterD = filterFactory.members(attributeD, ['d']);

describe('mergeTranslatedFilters', () => {
  it('merges two plain filter arrays, preserving order', () => {
    const result = mergeTranslatedFilters([filterA], [filterB]);
    expect(isFilterRelations(result)).toBe(false);
    expect(result).toEqual([filterA, filterB]);
  });

  it('merges an empty accumulator with a plain filter', () => {
    const result = mergeTranslatedFilters([], [filterA]);
    expect(result).toEqual([filterA]);
  });

  it('preserves a relation tree already in the accumulator when the incoming entry is a plain filter', () => {
    const accumulated = filterFactory.logic.or(filterA, filterB);
    const relations = asFilterRelations(mergeTranslatedFilters(accumulated, [filterC]));
    expect(relations.operator).toBe('AND');
    expect(asFilterRelations(relations.left).operator).toBe('OR');
  });

  it('preserves a relation tree in the incoming entry when the accumulator is a plain filter array', () => {
    const incoming = filterFactory.logic.or(filterA, filterB);
    const relations = asFilterRelations(mergeTranslatedFilters([filterC], incoming));
    expect(relations.operator).toBe('AND');
    // The incoming OR tree is preserved as-is (becomes `left`); the accumulator's plain filter
    // is attached as the new `right` leaf, per addFilterToRelations.
    expect(asFilterRelations(relations.left).operator).toBe('OR');
  });

  it('combines two relation trees under AND instead of flattening one of them', () => {
    const accumulated = filterFactory.logic.or(filterA, filterB);
    const incoming = filterFactory.logic.or(filterC, filterD);
    const relations = asFilterRelations(mergeTranslatedFilters(accumulated, incoming));
    expect(relations.operator).toBe('AND');
    expect(asFilterRelations(relations.left).operator).toBe('OR');
    expect(asFilterRelations(relations.right).operator).toBe('OR');
  });
});
