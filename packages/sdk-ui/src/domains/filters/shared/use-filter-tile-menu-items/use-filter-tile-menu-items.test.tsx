/** @vitest-environment jsdom */
import { createAttribute, filterFactory } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FilterTileConfig } from '@/domains/filters/components/filter-tile/types';

import { useFilterTileMenuItems } from './use-filter-tile-menu-items.js';

const mockAttribute = createAttribute({
  name: 'TestAttr',
  type: 'numeric-attribute',
  expression: '[Test.Attr]',
});

describe('useFilterTileMenuItems', () => {
  it('returns external items when passed in config', () => {
    const externalItem = { id: 'external', caption: 'External', onClick: vi.fn() };
    const config: FilterTileConfig = {
      header: { menu: { items: [externalItem] } },
    };
    const filter = filterFactory.greaterThan(mockAttribute, 10);

    const { result } = renderHook(() => useFilterTileMenuItems(filter, config, vi.fn()));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('external');
  });

  it('returns lock item when lockFilter.enabled is true', () => {
    const config: FilterTileConfig = { actions: { lockFilter: { enabled: true } } };
    const filter = filterFactory.greaterThan(mockAttribute, 10);
    const onChange = vi.fn();

    const { result } = renderHook(() => useFilterTileMenuItems(filter, config, onChange));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('filter-tile-lock');
  });
});
