import { useEffect, useMemo, useState } from 'react';

import { Attribute, DataSource } from '@sisense/sdk-data';
import isString from 'lodash-es/isString';
import partition from 'lodash-es/partition';

import { useHasChanged } from '@/shared/hooks/use-has-changed';

import { Hierarchy, HierarchyId } from '../hierarchy-model/index';
import { useHierarchiesLoader } from './use-hierarchies-loader';

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
  const [idsToLoad, nonIdPaths] = useMemo(
    () => partition(drilldownPaths, isString),
    [drilldownPaths],
  );
  const { getHierarchies } = useHierarchiesLoader();

  const [loadedHierarchies, setLoadedHierarchies] = useState<Hierarchy[]>([]);

  useEffect(() => {
    const isEnabled = enabled || enabled === undefined;
    if (isEnabled && isParamsChanged) {
      getHierarchies({ attribute, dataSource, ids: idsToLoad })
        .then((hierarchies) => {
          setLoadedHierarchies((existingHierarchies) => {
            const shouldUpdate =
              hierarchies.length > 0 || existingHierarchies.length !== hierarchies.length;
            return shouldUpdate ? hierarchies : existingHierarchies;
          });
        })
        .catch((error) => {
          console.error('Failed to load hierarchies', error);
        });
    }
  }, [isParamsChanged, enabled, attribute, dataSource, idsToLoad, getHierarchies]);

  return useMemo(() => {
    return loadedHierarchies.length ? [...loadedHierarchies, ...nonIdPaths] : nonIdPaths;
  }, [loadedHierarchies, nonIdPaths]);
}
