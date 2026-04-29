import {
  type DataSourceDimensionsErrorState,
  type DataSourceDimensionsLoadingState,
  type DataSourceDimensionsState,
  type DataSourceDimensionsSuccessState,
  type GetDataSourceDimensionsParams,
  HookAdapter,
  useGetDataSourceDimensionsInternal,
} from '@sisense/sdk-ui-preact';
import { onBeforeUnmount, toRefs, watch } from 'vue';

import { createSisenseContextConnector } from '../helpers/context-connectors';
import { useRefState } from '../helpers/use-ref-state';
import type { MaybeRefOrWithRefs } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

/** Reexport types from @sisense/sdk-ui-preact */
export type {
  GetDataSourceDimensionsParams,
  DataSourceDimensionsState,
  DataSourceDimensionsLoadingState,
  DataSourceDimensionsErrorState,
  DataSourceDimensionsSuccessState,
};

/**
 * A Vue composable function `useGetDataSourceDimensions` that fetches the dimensional model of a data source.
 *
 * @param {MaybeRefOrWithRefs<GetDataSourceDimensionsParams>} params - Parameters for fetching the data source dimensions, supporting reactive Vue refs.
 * Includes the data source to fetch dimensions for, and optional pagination and search parameters.
 *
 * @example
 * How to use `useGetDataSourceDimensions` within a Vue component:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useGetDataSourceDimensions } from '@sisense/sdk-ui-vue';
 * import * as DM from './data-model';
 *
 * const { dimensions, isLoading, isError, isSuccess, error } = useGetDataSourceDimensions({
 *   dataSource: DM.DataSource,
 * });
 * </script>
 *
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="isError">Error: {{ error?.message }}</div>
 *   <div v-else-if="dimensions">{{ dimensions }}</div>
 * </template>
 * ```
 *
 * The composable returns an object with the following reactive properties to manage the dimensions state:
 * - `dimensions`: The fetched dimensions of the data source, or `undefined` until the load succeeds.
 * - `isLoading`: Indicates if the dimensions load is in progress.
 * - `isError`: Indicates if an error occurred during the dimensions load.
 * - `isSuccess`: Indicates if the dimensions load completed successfully without errors.
 * - `error`: Contains the error object if an error occurred during the load.
 * - `status`: The status of the load operation ('loading', 'success', or 'error').
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
export const useGetDataSourceDimensions = (
  params: MaybeRefOrWithRefs<GetDataSourceDimensionsParams>,
) => {
  useTracking('useGetDataSourceDimensions');

  const hookAdapter = new HookAdapter(useGetDataSourceDimensionsInternal, [
    createSisenseContextConnector(),
  ]);

  const [dimensionsState, setDimensionsState] = useRefState<DataSourceDimensionsState>({
    isLoading: true,
    isError: false,
    isSuccess: false,
    dimensions: undefined,
    error: undefined,
    status: 'loading',
  });

  hookAdapter.subscribe((result) => {
    setDimensionsState(result);
  });

  hookAdapter.run(toPlainObject(params));

  watch([...collectRefs(params)], () => {
    hookAdapter.run(toPlainObject(params));
  });

  onBeforeUnmount(() => {
    hookAdapter.destroy();
  });

  return toRefs(dimensionsState.value);
};
