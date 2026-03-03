import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MenuItem } from '@/shared/types/menu-item';

import { FILTER_TILE_LOCK_MENU_ITEM_ID } from '../../../shared/use-filter-tile-menu-items/use-filter-tile-lock-menu-item';

/**
 * Builds the lock menu item for the cascading filter tile.
 *
 * @param locked - Current lock state
 * @param onLockToggle - Handler for lock toggle
 * @returns Filter tile lock menu item
 * @internal
 */
export function useCascadingFilterTileLockMenuItem({
  locked,
  onLockToggle,
}: {
  locked: boolean;
  onLockToggle: () => void;
}): MenuItem {
  const { t } = useTranslation();

  const lockCaption = useCallback((): string => {
    return locked ? t('filterTile.menu.unlockGroup') : t('filterTile.menu.lockGroup');
  }, [locked, t]);

  return useMemo(() => {
    return {
      id: FILTER_TILE_LOCK_MENU_ITEM_ID,
      caption: lockCaption(),
      onClick: onLockToggle,
    };
  }, [lockCaption, onLockToggle]);
}
