import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterTileMenuTargets } from '@/domains/filters/components/filter-tile/filter-tile-menu-targets';
import type { MenuActionItem } from '@/shared/types/menu-item';

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
}): MenuActionItem {
  const { t } = useTranslation();

  const lockCaption = useCallback((): string => {
    return locked ? t('filterTile.menu.unlock') : t('filterTile.menu.lock');
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
