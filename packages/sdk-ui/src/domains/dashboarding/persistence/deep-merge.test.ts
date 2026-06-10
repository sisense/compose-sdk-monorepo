import { describe, expect, it } from 'vitest';

import { deepMerge } from './deep-merge';

describe('deepMerge', () => {
  it('merges nested plain objects recursively, preserving sibling keys at every depth', () => {
    const base = { pagination: { currentPage: 1, location: 'left' }, theme: 'dark' };

    expect(deepMerge(base, { pagination: { currentPage: 3 } })).toEqual({
      pagination: { currentPage: 3, location: 'left' },
      theme: 'dark',
    });
  });

  it('replaces arrays wholesale instead of concatenating or merging by index', () => {
    expect(deepMerge({ ids: [1, 2, 3] }, { ids: [4] })).toEqual({ ids: [4] });
  });

  it('replaces primitives and adds new keys (last-write-wins)', () => {
    expect(deepMerge({ a: 1, b: 'x' }, { b: 'y', c: true })).toEqual({ a: 1, b: 'y', c: true });
  });

  it('does not mutate its inputs', () => {
    const base = { nested: { kept: 1 } };
    const update = { nested: { added: 2 } };

    const result = deepMerge(base, update);

    expect(base).toEqual({ nested: { kept: 1 } });
    expect(update).toEqual({ nested: { added: 2 } });
    expect(result).toEqual({ nested: { kept: 1, added: 2 } });
  });
});
