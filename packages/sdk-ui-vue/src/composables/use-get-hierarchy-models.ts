import type {
  ClientApplication,
  GetHierarchyModelsParams,
  HierarchyModel,
  WidgetModel,
} from '@sisense/sdk-ui-preact';
import { dataLoadStateReducer, getHierarchyModels } from '@sisense/sdk-ui-preact';
import { toRefs, watch } from 'vue';

import { useReducer } from '../helpers/use-reducer';
import { getSisenseContext } from '../providers';
import type { MaybeRefOrWithRefs } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

/**
 * A Vue composable function `useGetHierarchyModels` for retrieving hierarchy models from Sisense instance.
 *
 * @param {GetHierarchyModelsParams} params - The parameters for fetching the hierarchy models.
 *
 * @example
 * Retrieve hierarchy models:
 *
 * ```vue
 * <script setup lang="ts">
 * import { useGetHierarchyModels } from '@sisense/sdk-ui-vue';
 * const { data: hierarchyModels } = useGetHierarchyModels({
 *   dataSource: DM.DataSource,
 *   dimension: DM.DimCountries.Region,
 * });
 * </script>
 * ```
 *
 * The composable returns an object with reactive properties that represent the state of the hierarchy models fetch operation:
 * - `data`: Fetched hierarchy models, which is `undefined` until the operation is successfully completed.
 * - `isLoading`: A boolean indicating whether the fetch operation is currently in progress.
 * - `isError`: A boolean indicating whether an error occurred during the fetch operation.
 * - `isSuccess`: A boolean indicating whether the fetch operation was successfully completed without any errors.
 * - `error`: An error object containing details about any errors that occurred during the fetch operation.
 *
 * This composable streamlines the process of fetching and managing Sisense hierarchy models within Vue applications, providing
 * developers with a reactive and efficient way to integrate Sisense data visualizations and analytics.
 * @group Fusion Assets
 * @fusionEmbed
 */
export const useGetHierarchyModels = (params: MaybeRefOrWithRefs<GetHierarchyModelsParams>) => {
  const { hasTrackedRef } = useTracking('useGetHierarchyModels');
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<HierarchyModel[]>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const context = getSisenseContext();

  const runGetHierarchyModels = async (application: ClientApplication) => {
    try {
      dispatch({ type: 'loading' });
      const data = await getHierarchyModels(application.httpClient, toPlainObject(params));

      dispatch({ type: 'success', data });
    } catch (error) {
      dispatch({ type: 'error', error: error as Error });
    }
  };

  watch(
    [...collectRefs(params), context],
    () => {
      const { app } = context.value;
      const { enabled } = toPlainObject(params);
      const isEnabled = enabled === undefined || enabled === true;
      if (!app || !isEnabled) return;
      runGetHierarchyModels(app);
    },
    { immediate: true },
  );

  return toRefs(dataState.value);
};
