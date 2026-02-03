import { useCallback, useReducer } from 'react';

import { Attribute, DataSource } from '@sisense/sdk-data';
import isString from 'lodash-es/isString';
import partition from 'lodash-es/partition';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { dataLoadStateReducer } from '@/shared/hooks/data-load-state-reducer';

import { Hierarchy, HierarchyId } from '../hierarchy-model';
import { getHierarchyModels } from '../hierarchy-model/get-hierarchy-models';

/**
 * States of synced drilldown paths.
 */
export type SyncedDrilldownPathsState =
  | SyncedDrilldownPathsLoadingState
  | SyncedDrilldownPathsErrorState
  | SyncedDrilldownPathsSuccessState;

/**
 * State of synced drilldown paths that is loading.
 */
export type SyncedDrilldownPathsLoadingState = {
  /** Whether the hierarchy models is loading */
  isLoading: true;
  /** Whether the hierarchy models load has failed */
  isError: false;
  /** Whether the hierarchy models load has succeeded */
  isSuccess: false;
  /** Error, if one occurred */
  error: undefined;
  /** Loading status */
  status: 'loading';
  /** Synced drilldown paths, if the load is in progress */
  drilldownPaths: (Attribute | Hierarchy)[] | undefined;
};

/**
 * State of a synced drilldown paths load that has failed.
 */
export type SyncedDrilldownPathsErrorState = {
  /** Whether the hierarchy models is loading */
  isLoading: false;
  /** Whether the hierarchy models load has failed */
  isError: true;
  /** Whether the hierarchy models load has succeeded */
  isSuccess: false;
  /** Error, if one occurred */
  error: Error;
  /** Loading status */
  status: 'error';
  /** Synced drilldown paths, if the load failed */
  drilldownPaths: undefined;
};

/**
 * State of a synced drilldown paths load that has succeeded.
 */
export type SyncedDrilldownPathsSuccessState = {
  /** Whether the hierarchy models is loading */
  isLoading: false;
  /** Whether the hierarchy models load has failed */
  isError: false;
  /** Whether the hierarchy models load has succeeded */
  isSuccess: true;
  /** Error, if one occurred */
  error: undefined;
  /** Loading status */
  status: 'success';
  /** Synced drilldown paths, if the load succeeded */
  drilldownPaths: (Attribute | Hierarchy)[];
};

/**
 * Parameters for synchronizing drilldown paths.
 *
 * @internal
 */
export interface SynchronizeParams {
  /** The attribute/dimension for which to synchronize hierarchies */
  attribute: Attribute;
  /** The data source from which to retrieve hierarchies */
  dataSource?: DataSource;
  /** The drilldown paths to synchronize (can include Attribute, Hierarchy objects, or HierarchyId strings) */
  drilldownPaths?: (Attribute | Hierarchy | HierarchyId)[];
}

/**
 * Result returned by {@link useSyncedDrilldownPathsManager}.
 */
export type SyncedDrilldownPathsManagerResult = SyncedDrilldownPathsState & {
  /**
   * A function to synchronize drilldown paths that loads hierarchy IDs from the server
   *
   * @param params - Parameters for synchronization
   * @returns Promise that resolves with the synchronized drilldown paths
   */
  synchronize: (params: SynchronizeParams) => Promise<(Attribute | Hierarchy)[]>;
};

/**
 * Manages synchronization of drilldown paths with hierarchy data from a Fusion instance.
 * It provides a `synchronize` function that can be called manually to trigger loading.
 *
 * It loads all hierarchies provided as hierarchy IDs, and optionally includes hierarchies
 * that are marked as `alwaysIncluded` in a Fusion instance.
 *
 * @returns Synchronization function and loading state.
 *
 * @example
 * ```tsx
 * const { synchronize, isLoading, isError } = useSyncedDrilldownPathsManager();
 *
 * // Trigger synchronization manually
 * const handleSync = async () => {
 *   try {
 *     const synchronizedPaths = await synchronize({
 *       attribute: DM.Commerce.AgeRange,
 *       drilldownPaths: ['hierarchy-id-1', 'hierarchy-id-2', DM.Commerce.Gender],
 *       alwaysIncluded: true,
 *     });
 *     console.log('Synchronized paths:', synchronizedPaths);
 *   } catch (error) {
 *     console.error('Synchronization failed:', error);
 *   }
 * };
 * ```
 *
 * @internal
 */
export function useSyncedDrilldownPathsManager(): SyncedDrilldownPathsManagerResult {
  const { isInitialized, app } = useSisenseContext();

  const [loadState, dispatch] = useReducer(dataLoadStateReducer<(Attribute | Hierarchy)[]>, {
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
    error: undefined,
    data: [],
  });

  const synchronize = useCallback(
    async (params: SynchronizeParams): Promise<(Attribute | Hierarchy)[]> => {
      const { attribute, dataSource, drilldownPaths = [] } = params;

      if (!isInitialized || !app) {
        const error = new TranslatableError('errors.noSisenseContext');
        dispatch({ type: 'error', error });
        throw error;
      }

      // Separate hierarchy IDs from other paths
      const [idsToLoad, nonIdPaths] = partition(drilldownPaths, isString);

      // If there are no hierarchy IDs to load, return the non-ID paths
      if (idsToLoad.length === 0) {
        dispatch({ type: 'success', data: nonIdPaths });
        return nonIdPaths;
      }

      dispatch({ type: 'loading' });

      try {
        const loadedHierarchies = await getHierarchyModels(
          app.httpClient,
          {
            dimension: attribute,
            dataSource,
            ids: idsToLoad,
            alwaysIncluded: true,
          },
          app.defaultDataSource,
        );

        // Combine loaded hierarchies with non-ID paths
        const syncedPaths = loadedHierarchies.length
          ? [...loadedHierarchies, ...nonIdPaths]
          : nonIdPaths;

        dispatch({ type: 'success', data: syncedPaths });

        return syncedPaths;
      } catch (error) {
        const syncError = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'error', error: syncError });
        throw syncError;
      }
    },
    [isInitialized, app],
  );

  return {
    ...loadState,
    drilldownPaths: loadState.data,
    synchronize,
  } as SyncedDrilldownPathsManagerResult;
}
