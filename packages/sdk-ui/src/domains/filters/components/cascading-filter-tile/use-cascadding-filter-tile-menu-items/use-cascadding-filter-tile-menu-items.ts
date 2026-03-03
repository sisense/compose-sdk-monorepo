import { useCallback, useMemo } from 'react';

import { type CascadingFilter } from '@sisense/sdk-data';

import type { MenuItem } from '@/shared/types/menu-item';

import type { FilterTileConfig } from '../../../components/filter-tile/types';
import { cloneFilterAndToggleLocked } from '../../../shared/clone-filter-and-toggle-locked';
import { useCascadingFilterTileLockMenuItem } from './use-cascadding-filter-tile-lock-menu-item';

/**
 * Builds the menu items list for a cascading filter tile,
 * conditionally prepending them based on config.
 *
 * @param filter - The current filter
 * @param config - Filter tile configuration
 * @param onChange - Callback invoked when the filter changes (e.g., lock toggle)
 * @returns Filter tile menu items
 * @internal
 */
export function useCascadingFilterTileMenuItems(
  filter: CascadingFilter,
  config: FilterTileConfig | undefined,
  onChange: ((filter: CascadingFilter) => void) | undefined,
): MenuItem[] {
  const lockMenuItem = useCascadingFilterTileLockMenuItem({
    locked: filter.config.locked,
    onLockToggle: useCallback(
      () => onChange?.(cloneFilterAndToggleLocked(filter)),
      [filter, onChange],
    ),
  });

  const lockEnabled = config?.actions?.lockFilter?.enabled ?? false;
  const externalItems = config?.header?.menu?.items;

  return useMemo(
    () => [...(lockEnabled ? [lockMenuItem] : []), ...(externalItems ?? [])],
    [lockEnabled, lockMenuItem, externalItems],
  );
}
