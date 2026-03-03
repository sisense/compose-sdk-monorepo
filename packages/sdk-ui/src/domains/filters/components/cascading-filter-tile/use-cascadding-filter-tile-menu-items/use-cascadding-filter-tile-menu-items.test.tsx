/** @vitest-environment jsdom */
import { CascadingFilter, createAttribute, filterFactory } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FilterTileConfig } from '@/domains/filters/components/filter-tile/types';

import { useCascadingFilterTileMenuItems } from './use-cascadding-filter-tile-menu-items.js';

const mockAttribute = createAttribute({
  name: 'LevelAttr',
  type: 'numeric-attribute',
  expression: '[Level.Attr]',
});

function createCascadingFilter(locked = false): CascadingFilter {
  const levelFilter = filterFactory.greaterThan(mockAttribute, 0);
  return new CascadingFilter([levelFilter], { guid: 'guid-1', disabled: false, locked });
}

describe('useCascadingFilterTileMenuItems', () => {
  it('returns external items when passed in config', () => {
    const externalItem = { id: 'external', caption: 'External', onClick: vi.fn() };
    const config: FilterTileConfig = {
      header: { menu: { items: [externalItem] } },
    };
    const filter = createCascadingFilter();

    const { result } = renderHook(() => useCascadingFilterTileMenuItems(filter, config, vi.fn()));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('external');
  });

  it('returns lock item when lockFilter.enabled is true', () => {
    const config: FilterTileConfig = { actions: { lockFilter: { enabled: true } } };
    const filter = createCascadingFilter(false);
    const onChange = vi.fn();

    const { result } = renderHook(() => useCascadingFilterTileMenuItems(filter, config, onChange));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('filter-tile-lock');
  });
});
