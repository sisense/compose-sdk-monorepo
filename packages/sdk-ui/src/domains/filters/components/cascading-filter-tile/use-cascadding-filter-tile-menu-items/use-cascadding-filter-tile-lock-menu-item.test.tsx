/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FILTER_TILE_LOCK_MENU_ITEM_ID } from '@/domains/filters/shared/use-filter-tile-menu-items/use-filter-tile-lock-menu-item';

import { useCascadingFilterTileLockMenuItem } from './use-cascadding-filter-tile-lock-menu-item.js';

describe('useCascadingFilterTileLockMenuItem', () => {
  it('returns correct lock menu item', () => {
    const onLockToggle = vi.fn();
    const { result } = renderHook(() =>
      useCascadingFilterTileLockMenuItem({ locked: false, onLockToggle }),
    );

    expect(result.current.id).toBe(FILTER_TILE_LOCK_MENU_ITEM_ID);
    expect(result.current.caption).toBe('filterTile.menu.lockGroup');
    expect(result.current.onClick).toBeDefined();
  });

  it('returns valid caption for unlock action', () => {
    const onLockToggle = vi.fn();
    const { result } = renderHook(() =>
      useCascadingFilterTileLockMenuItem({ locked: true, onLockToggle }),
    );

    expect(result.current.caption).toBe('filterTile.menu.unlockGroup');
  });

  it('returns onClick that invokes onLockToggle', () => {
    const onLockToggle = vi.fn();
    const { result } = renderHook(() =>
      useCascadingFilterTileLockMenuItem({ locked: false, onLockToggle }),
    );

    result.current.onClick();

    expect(onLockToggle).toHaveBeenCalledTimes(1);
  });
});
