/** @vitest-environment jsdom */
import { createAttribute, filterFactory } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterTileMenuTargets } from '@/domains/filters/components/filter-tile/filter-tile-menu-targets';
import type { FilterTileConfig } from '@/domains/filters/components/filter-tile/types';

import { useFilterTileMenuItems } from './use-filter-tile-menu-items.js';

const mockAttribute = createAttribute({
  name: 'TestAttr',
  type: 'numeric-attribute',
  expression: '[Test.Attr]',
});

describe('useFilterTileMenuItems', () => {
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
    expect(result.current[0].id).toBe(FilterTileMenuTargets.Lock);
  });

  it('lists custom items after the built-in lock item, as documented', () => {
    const externalItem = {
      type: 'action' as const,
      id: 'external',
      caption: 'External',
      onClick: vi.fn(),
    };
    const config: FilterTileConfig = {
      header: { menu: { items: [externalItem] } },
      actions: { lockFilter: { enabled: true } },
    };
    const filter = filterFactory.greaterThan(mockAttribute, 10);

    const { result } = renderHook(() => useFilterTileMenuItems(filter, config, vi.fn()));

    expect(result.current.map((item) => item.id)).toEqual([FilterTileMenuTargets.Lock, 'external']);
  });
  it('offers the lock item by default, with no config at all', () => {
    const filter = filterFactory.greaterThan(mockAttribute, 10);

    const { result } = renderHook(() => useFilterTileMenuItems(filter, undefined, vi.fn()));

    expect(result.current.map((item) => item.id)).toEqual([FilterTileMenuTargets.Lock]);
  });

  it('omits the lock item when lockFilter.enabled is explicitly false', () => {
    const config: FilterTileConfig = { actions: { lockFilter: { enabled: false } } };
    const filter = filterFactory.greaterThan(mockAttribute, 10);

    const { result } = renderHook(() => useFilterTileMenuItems(filter, config, vi.fn()));

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
      const filter = filterFactory.greaterThan(mockAttribute, 10);

      const { result } = renderHook(() => useFilterTileMenuItems(filter, config, vi.fn()));

      expect(result.current).toHaveLength(0);
    });

    it('keeps the menu when enabled is left unset', () => {
      const filter = filterFactory.greaterThan(mockAttribute, 10);

      const { result } = renderHook(() => useFilterTileMenuItems(filter, undefined, vi.fn()));

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
      const filter = filterFactory.greaterThan(mockAttribute, 10);

      const { result } = renderHook(() => useFilterTileMenuItems(filter, config, vi.fn()));

      expect(result.current.map((item) => item.id)).toEqual(['group']);
    });

    it('drops a submenu with no items, as documented', () => {
      const config: FilterTileConfig = {
        header: {
          menu: { items: [{ type: 'submenu', id: 'empty', caption: 'Empty', items: [] }] },
        },
        actions: { lockFilter: { enabled: false } },
      };
      const filter = filterFactory.greaterThan(mockAttribute, 10);

      const { result } = renderHook(() => useFilterTileMenuItems(filter, config, vi.fn()));

      expect(result.current).toHaveLength(0);
    });
  });
});
