import type { MaybeRefOrWithRefs } from '../types';
import type {
  ClientApplication,
  DashboardModel,
  DataState,
  GetDashboardModelParams,
} from '@sisense/sdk-ui-preact';
import {
  getDashboardModel,
  dataLoadStateReducer,
  translateToDashboardResponse,
} from '@sisense/sdk-ui-preact';
import { useReducer } from '../helpers/use-reducer';
import { toRefs, watch } from 'vue';
import { getSisenseContext } from '../providers';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

/**
 * A Vue composable function `useGetDashboardModel` for fetching a Sisense dashboard model.
 * It simplifies the process of retrieving detailed dashboard data, including widgets if specified,
 * by managing the loading, success, and error states of the request. This composable is especially useful
 * for Vue applications that need to integrate Sisense dashboard analytics, providing a reactive way to fetch
 * and display dashboard data.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @param {GetDashboardModelParams} params - The parameters for fetching the dashboard model, including the
 * dashboard OID and an option to include widgets within the dashboard. Supports dynamic parameter values through
 * Vue refs, allowing for reactive dashboard loading based on user interactions or other application states.
 *
 * @example
 * How to use `useGetDashboardModel` within a Vue component to fetch and display a Sisense dashboard:
 * ```vue
 * <template>
 *  <Dashboard
 *    v-if="dashboardProps"
 *    :title="dashboardProps.title"
 *    :layoutOptions="dashboardProps.layoutOptions"
 *    :widgets="dashboardProps.widgets"
 *    :filters="dashboardProps.filters"
 *    :defaultDataSource="dashboardProps.dataSource"
 *    :widgetsOptions="dashboardProps.widgetsOptions"
 *    :styleOptions="dashboardProps.styleOptions"
 *  />
 * </template>
 *
 * <script setup lang="ts">
 * import { dashboardModelTranslator, useGetDashboardModel } from '@sisense/sdk-ui-vue';
 *
 * const { dashboard } = useGetDashboardModel({
 *  dashboardOid: '6441e728dac1920034bce737',
 *  includeWidgets: true,
 *  includeFilters: true,
 * });
 *
 * const dashboardProps = computed(() =>
 *   dashboard.value ? dashboardModelTranslator.toDashboardProps(dashboard.value) : null,
 * );
 * </script>
 * ```
 *
 * The composable returns an object with reactive properties to manage the state of the dashboard model fetching process:
 * - `dashboard`: The fetched dashboard model data, which is `undefined` until the fetch completes successfully.
 * - `isLoading`: Indicates if the dashboard model is currently being fetched.
 * - `isError`: Indicates if an error occurred during the fetch process.
 * - `isSuccess`: Indicates if the dashboard model was successfully fetched without errors.
 * - `error`: Contains the error object if an error occurred during the fetch.
 *
 * Utilizing this composable enables developers to declaratively integrate Sisense dashboard analytics into their Vue applications,
 * managing data fetching and state with minimal boilerplate code.
 * @group Fusion Assets
 * @fusionEmbed
 */

export const useGetDashboardModel = (params: MaybeRefOrWithRefs<GetDashboardModelParams>) => {
  const { hasTrackedRef } = useTracking('useGetDashboardModel');
  const [queryState, dispatch] = useReducer(dataLoadStateReducer<DashboardModel>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const context = getSisenseContext();

  const runGetDashboardModel = async (application: ClientApplication) => {
    try {
      dispatch({ type: 'loading' });
      const { dashboardOid, includeWidgets, includeFilters } = toPlainObject(params);

      const data = await getDashboardModel(application.httpClient, dashboardOid, {
        includeWidgets,
        includeFilters,
      });

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
      runGetDashboardModel(app);
    },
    { immediate: true },
  );

  const refState = toRefs(queryState.value);
  return toRefs(translateToDashboardResponse(refState as unknown as DataState<DashboardModel>));
};
