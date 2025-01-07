import type {
  ClientApplication,
  DashboardModel,
  DataState,
  GetDashboardModelsParams,
} from '@sisense/sdk-ui-preact';
import {
  getDashboardModels,
  dataLoadStateReducer,
  translateToDashboardsResponse,
} from '@sisense/sdk-ui-preact';
import { useReducer } from '../helpers/use-reducer';
import { toRefs, watch } from 'vue';
import { getSisenseContext } from '../providers';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';
import type { MaybeRefOrWithRefs } from '../types';

/**
 * A Vue composable function `useGetDashboardModels` for fetching multiple Sisense dashboard models.
 * This function abstracts the complexities of managing API calls and state management for fetching an array of
 * dashboard models from Sisense. It provides a reactive interface to handle loading, success, and error states,
 * making it easier to integrate Sisense analytics within Vue applications.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @param params - Parameters for fetching the dashboard models, which can include filters,
 * sorting options, and pagination settings to customize the fetch operation. The parameters allow for precise control
 * over which dashboards are retrieved and in what order.
 *
 * @example
 * How to use `useGetDashboardModels` within a Vue component to fetch and list Sisense dashboards:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useGetDashboardModels } from '@sisense/sdk-ui-vue';
 *
 * const params = ref({
 *   // Define your parameters here, such as pagination settings, filters, etc.
 * });
 *
 * const { data: dashboardModels, isLoading, isError, error } = useGetDashboardModels(params);
 * </script>
 * ```
 *
 * The composable returns an object with reactive properties that represent the state of the fetch operation:
 * - `data`: An array of dashboard models returned from the fetch operation. This is `undefined` until the operation completes successfully.
 * - `isLoading`: A boolean indicating whether the fetch operation is currently in progress.
 * - `isError`: A boolean indicating whether an error occurred during the fetch operation.
 * - `isSuccess`: A boolean indicating whether the fetch operation completed successfully without any errors.
 * - `error`: An error object containing details about any errors that occurred during the fetch operation.
 *
 * This composable is ideal for Vue applications requiring a list of Sisense dashboards, providing a streamlined, reactive
 * way to fetch and manage the state of multiple dashboard models.
 * @group Fusion Assets
 * @fusionEmbed
 */

export const useGetDashboardModels = (params: MaybeRefOrWithRefs<GetDashboardModelsParams>) => {
  const { hasTrackedRef } = useTracking('useGetDashboardModels');
  const [queryState, dispatch] = useReducer(dataLoadStateReducer<DashboardModel[]>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const context = getSisenseContext();

  const runGetDashboardModels = async (application: ClientApplication) => {
    try {
      dispatch({ type: 'loading' });
      const plainParams = toPlainObject(params);
      const data = await getDashboardModels(application.httpClient, plainParams);

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
      runGetDashboardModels(app);
    },
    { immediate: true },
  );

  const refState = toRefs(queryState.value);
  return toRefs(translateToDashboardsResponse(refState as unknown as DataState<DashboardModel[]>));
};
