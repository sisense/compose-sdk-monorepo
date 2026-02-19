import { useEffect, useMemo } from 'react';

import { Attribute, DataSource } from '@sisense/sdk-data';

import { useHasChanged } from '@/shared/hooks/use-has-changed';

import { Hierarchy, HierarchyId } from '../../drilldown/hierarchy-model';
import { useSyncedDrilldownPathsManager } from '../../drilldown/hooks/use-synced-drilldown-paths-manager';

/**
 * Synchronizes drilldown paths with hierarchy data from a Fusion instance.
 * It loads all hierarchies provided as hierarchy IDs, and also includes any hierarchies
 * that are marked as `alwaysIncluded` in a Fusion instance.
 *
 * @internal
 */
export function useSyncedDrilldownPaths(params: {
  attribute: Attribute;
  dataSource?: DataSource;
  drilldownPaths?: (Attribute | Hierarchy | HierarchyId)[];
  enabled: boolean;
}) {
  const isParamsChanged = useHasChanged(params, [
    'attribute',
    'dataSource',
    'drilldownPaths',
    'enabled',
  ]);
  const { attribute, dataSource, drilldownPaths, enabled } = params;
  const { drilldownPaths: syncedDrilldownPaths, synchronize: synchronizeDrilldownPaths } =
    useSyncedDrilldownPathsManager();

  useEffect(() => {
    const isEnabled = enabled || enabled === undefined;
    if (isEnabled && isParamsChanged) {
      synchronizeDrilldownPaths({ attribute, dataSource, drilldownPaths });
    }
  }, [isParamsChanged, enabled, attribute, dataSource, drilldownPaths, synchronizeDrilldownPaths]);

  return useMemo(() => syncedDrilldownPaths ?? [], [syncedDrilldownPaths]);
}
