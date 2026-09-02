import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MenuActionItem } from '@/shared/types/menu-item';

import { FilterTileMenuTargets } from '../../filter-tile/filter-tile-menu-targets';

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
}): MenuActionItem {
  const { t } = useTranslation();

  const lockCaption = useCallback((): string => {
    return locked ? t('filterTile.menu.unlockGroup') : t('filterTile.menu.lockGroup');
  }, [locked, t]);

  return useMemo(() => {
    return {
      type: 'action' as const,
      id: FilterTileMenuTargets.Lock,
      caption: lockCaption(),
      onClick: onLockToggle,
    };
  }, [lockCaption, onLockToggle]);
}
