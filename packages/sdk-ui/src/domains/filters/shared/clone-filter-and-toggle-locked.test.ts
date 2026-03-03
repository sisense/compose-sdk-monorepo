import { createAttribute, filterFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { cloneFilterAndToggleLocked } from './clone-filter-and-toggle-locked.js';

const mockAttribute = createAttribute({
  name: 'TestAttr',
  type: 'numeric-attribute',
  expression: '[Test.Attr]',
});

describe('cloneFilterAndToggleLocked', () => {
  it('toggles locked flag value', () => {
    const filter = filterFactory.greaterThan(mockAttribute, 10);
    filter.config.locked = false;

    const result = cloneFilterAndToggleLocked(filter);

    expect(result).not.toBe(filter);
    expect(result.config.locked).toBe(true);
  });

  it('preserves other filter properties after clone', () => {
    const filter = filterFactory.members(mockAttribute, ['a', 'b']);
    filter.config.locked = true;
    filter.config.disabled = true;

    const result = cloneFilterAndToggleLocked(filter);

    expect(result.attribute).toEqual(filter.attribute);
    expect(result.config.disabled).toBe(true);
    expect(result.config.locked).toBe(false);
  });
});
