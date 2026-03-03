import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MenuItem } from '@/shared/types/menu-item';

/** Id for the lock/unlock menu item of the filter tile. */
export const FILTER_TILE_LOCK_MENU_ITEM_ID = 'filter-tile-lock';

/**
 * Builds the lock menu item for the filter tile.
 *
 * @param locked - Current lock state
 * @param onLockToggle - Handler for lock toggle
 * @returns Filter tile lock menu item
 * @internal
 */
export function useFilterTileLockMenuItem({
  locked,
  onLockToggle,
}: {
  locked: boolean;
  onLockToggle: () => void;
}): MenuItem {
  const { t } = useTranslation();

  const lockCaption = useCallback((): string => {
    return locked ? t('filterTile.menu.unlock') : t('filterTile.menu.lock');
  }, [locked, t]);

  return useMemo(() => {
    return {
      id: FILTER_TILE_LOCK_MENU_ITEM_ID,
      caption: lockCaption(),
      onClick: onLockToggle,
    };
  }, [lockCaption, onLockToggle]);
}
