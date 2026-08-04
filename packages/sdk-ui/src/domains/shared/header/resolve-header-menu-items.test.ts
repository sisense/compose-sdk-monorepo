import { describe, expect, it, vi } from 'vitest';

import { isMenuSubmenuItem, MenuItem } from '@/shared/types/menu-item';

import { resolveHeaderMenuItems } from './resolve-header-menu-items.js';

const items: MenuItem[] = [
  { type: 'action', id: 'first', caption: 'First', onClick: vi.fn() },
  { type: 'action', id: 'second', caption: 'Second', onClick: vi.fn() },
];

/** Ids of a submenu's children, or `undefined` when the item is not a submenu. */
const childIdsOf = (item: MenuItem | undefined): string[] | undefined =>
  item && isMenuSubmenuItem(item) ? item.items.map((child) => child.id) : undefined;

describe('resolveHeaderMenuItems', () => {
  it('returns an empty list when no config is provided', () => {
    expect(resolveHeaderMenuItems()).toEqual([]);
  });

  it('returns an empty list when the config has no items', () => {
    expect(resolveHeaderMenuItems({})).toEqual([]);
  });

  it('returns the items when enabled is not specified', () => {
    expect(resolveHeaderMenuItems({ items })).toEqual(items);
  });

  it('returns the items when enabled is true', () => {
    expect(resolveHeaderMenuItems({ enabled: true, items })).toEqual(items);
  });

  it('returns an empty list when enabled is false, even with items', () => {
    expect(resolveHeaderMenuItems({ enabled: false, items })).toEqual([]);
  });

  it('preserves declaration order', () => {
    expect(resolveHeaderMenuItems({ items }).map((item) => item.id)).toEqual(['first', 'second']);
  });

  describe('empty submenus', () => {
    it('keeps a submenu that has items', () => {
      const submenu: MenuItem = { type: 'submenu', id: 'submenu', caption: 'Submenu', items };
      expect(resolveHeaderMenuItems({ items: [submenu] })).toEqual([submenu]);
    });

    it('drops a submenu with no items', () => {
      const submenu: MenuItem = { type: 'submenu', id: 'submenu', caption: 'Submenu', items: [] };
      expect(resolveHeaderMenuItems({ items: [submenu, ...items] })).toEqual(items);
    });

    it('drops a submenu whose only child is an empty submenu', () => {
      const submenu: MenuItem = {
        type: 'submenu',
        id: 'submenu',
        caption: 'Submenu',
        items: [{ type: 'submenu', id: 'nested', caption: 'Nested', items: [] }],
      };
      expect(resolveHeaderMenuItems({ items: [submenu] })).toEqual([]);
    });

    it('keeps a submenu that still has items and prunes its empty sibling', () => {
      const result = resolveHeaderMenuItems({
        items: [
          {
            type: 'submenu',
            id: 'submenu',
            caption: 'Submenu',
            items: [
              { type: 'submenu', id: 'empty', caption: 'Empty', items: [] },
              { type: 'action', id: 'leaf', caption: 'Leaf', onClick: vi.fn() },
            ],
          },
        ],
      });

      expect(result).toHaveLength(1);
      expect(childIdsOf(result[0])).toEqual(['leaf']);
    });

    it('does not mutate the input items', () => {
      const submenu: MenuItem = {
        type: 'submenu',
        id: 'submenu',
        caption: 'Submenu',
        items: [{ type: 'submenu', id: 'empty', caption: 'Empty', items: [] }],
      };
      const input = [submenu];
      resolveHeaderMenuItems({ items: input });
      expect(input).toEqual([submenu]);
      expect(childIdsOf(submenu)).toEqual(['empty']);
    });
  });
});
