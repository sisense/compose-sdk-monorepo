import { useMemo } from 'react';
import { Attribute, DataSource } from '@sisense/sdk-data';
import isString from 'lodash-es/isString';
import partition from 'lodash-es/partition';
import { Hierarchy, HierarchyId } from '@/models/hierarchy';
import { useGetHierarchyModelsInternal } from '@/models/hierarchy/use-get-hierarchy-models';

/**
 * Synchronizes drilldown paths with hierarchy data from a Fusion instance.
 * It loads all hierarchies provided as hierarchy IDs, and also includes any hierarchies
 * that are marked as `alwaysIncluded` in a Fusion instance.
 *
 * @internal
 */
export function useSyncedDrilldownPaths({
  attribute,
  dataSource,
  drilldownPaths = [],
  enabled,
}: {
  attribute: Attribute;
  dataSource?: DataSource;
  drilldownPaths?: (Attribute | Hierarchy | HierarchyId)[];
  enabled: boolean;
}) {
  // Separate hierarchy IDs from the plain hierarchy objects and dimensions in `drilldownPaths` list
  const [hierarchyIds, otherDrilldownPaths] = useMemo(() => {
    return partition(drilldownPaths, isString);
  }, [drilldownPaths]);

  const { hierarchies: loadedHierarchies = [] } = useGetHierarchyModelsInternal({
    enabled,
    dataSource,
    dimension: attribute,
    ids: hierarchyIds,
    alwaysIncluded: true,
  });

  return useMemo(
    () =>
      loadedHierarchies.length
        ? [...loadedHierarchies, ...otherDrilldownPaths]
        : otherDrilldownPaths,
    [loadedHierarchies, otherDrilldownPaths],
  );
}
