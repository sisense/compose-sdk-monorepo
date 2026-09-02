/** @vitest-environment jsdom */
import { CascadingFilter, createAttribute, filterFactory } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterTileMenuTargets } from '@/domains/filters/components/filter-tile/filter-tile-menu-targets';
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
    const externalItem = {
      type: 'action' as const,
      id: 'external',
      caption: 'External',
      onClick: vi.fn(),
    };
    const config: FilterTileConfig = {
      header: { menu: { items: [externalItem] } },
      // Isolates the external item: the built-in lock item is present by default.
      actions: { lockFilter: { enabled: false } },
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
    expect(result.current[0].id).toBe(FilterTileMenuTargets.Lock);
  });
  it('offers the lock item by default, with no config at all', () => {
    const { result } = renderHook(() =>
      useCascadingFilterTileMenuItems(createCascadingFilter(), undefined, vi.fn()),
    );

    expect(result.current.map((item) => item.id)).toEqual([FilterTileMenuTargets.Lock]);
  });

  it('omits the lock item when lockFilter.enabled is explicitly false', () => {
    const config: FilterTileConfig = { actions: { lockFilter: { enabled: false } } };

    const { result } = renderHook(() =>
      useCascadingFilterTileMenuItems(createCascadingFilter(), config, vi.fn()),
    );

    expect(result.current).toHaveLength(0);
  });
  describe('menu.enabled', () => {
    it('hides every item, built-in lock included, when the menu is disabled', () => {
      const config: FilterTileConfig = {
        header: {
          menu: {
            enabled: false,
            items: [{ type: 'action', id: 'external', caption: 'External', onClick: vi.fn() }],
          },
        },
        actions: { lockFilter: { enabled: true } },
      };
      const filter = createCascadingFilter();

      const { result } = renderHook(() => useCascadingFilterTileMenuItems(filter, config, vi.fn()));

      expect(result.current).toHaveLength(0);
    });

    it('keeps the menu when enabled is left unset', () => {
      const filter = createCascadingFilter();

      const { result } = renderHook(() =>
        useCascadingFilterTileMenuItems(filter, undefined, vi.fn()),
      );

      expect(result.current).toHaveLength(1);
    });
  });

  describe('submenu items', () => {
    it('passes a populated submenu through', () => {
      const config: FilterTileConfig = {
        header: {
          menu: {
            items: [
              {
                type: 'submenu',
                id: 'group',
                caption: 'Group',
                items: [{ type: 'action', id: 'nested', caption: 'Nested', onClick: vi.fn() }],
              },
            ],
          },
        },
        actions: { lockFilter: { enabled: false } },
      };
      const filter = createCascadingFilter();

      const { result } = renderHook(() => useCascadingFilterTileMenuItems(filter, config, vi.fn()));

      expect(result.current.map((item) => item.id)).toEqual(['group']);
    });

    it('drops a submenu with no items, as documented', () => {
      const config: FilterTileConfig = {
        header: {
          menu: { items: [{ type: 'submenu', id: 'empty', caption: 'Empty', items: [] }] },
        },
        actions: { lockFilter: { enabled: false } },
      };
      const filter = createCascadingFilter();

      const { result } = renderHook(() => useCascadingFilterTileMenuItems(filter, config, vi.fn()));

      expect(result.current).toHaveLength(0);
    });
  });
});
