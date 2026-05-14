import { useCallback } from 'react';

import { Attribute, DataSource } from '@sisense/sdk-data';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { TranslatableError } from '@/infra/translation/translatable-error';

import { Hierarchy, HierarchyId } from '../hierarchy-model';
import { getHierarchyModels } from '../hierarchy-model/get-hierarchy-models';

export interface GetHierarchiesParams {
  /** The attribute/dimension for which to load hierarchies */
  attribute: Attribute;
  /** The data source from which to retrieve hierarchies */
  dataSource?: DataSource;
  /** The hierarchy IDs to load */
  ids: HierarchyId[];
}

/**
 * Provides a `getHierarchies` function that loads hierarchy models from a Fusion instance by ID,
 * including any hierarchies marked as `alwaysIncluded`.
 */
export function useHierarchiesLoader() {
  const { isInitialized, app } = useSisenseContext();

  const getHierarchies = useCallback(
    async (params: GetHierarchiesParams): Promise<Hierarchy[]> => {
      const { attribute, dataSource, ids } = params;

      if (!isInitialized || !app) {
        throw new TranslatableError('errors.noSisenseContext');
      }

      return getHierarchyModels(
        app.httpClient,
        {
          dimension: attribute,
          dataSource,
          ids,
          alwaysIncluded: true,
        },
        app.defaultDataSource,
      );
    },
    [isInitialized, app],
  );

  return { getHierarchies };
}
