import { useReducer } from '../helpers/use-reducer';
import { getSisenseContext } from '../providers';
import { collectRefs, toPlainObject } from '../utils';
import type { ClientApplication, GetWidgetModelParams, WidgetModel } from '@sisense/sdk-ui-preact';
import { dataLoadStateReducer, getWidgetModel } from '@sisense/sdk-ui-preact';
import { toRefs, watch } from 'vue';
import { useTracking } from './use-tracking';
import type { MaybeRefOrWithRefs } from '../types';

/**
 * A Vue composable function `useGetWidgetModel` for retrieving widget models from a Sisense dashboard.
 * It is designed to fetch a specific widget model based on the provided dashboard and widget OIDs, handling the loading,
 * success, and error states of the fetch operation. This composable is particularly useful for Vue applications that
 * require detailed information about a Sisense widget for data visualization or analytics purposes.
 *
 * @param {GetWidgetModelParams} params - The parameters for fetching the widget model, including the `dashboardOid`
 * (the OID of the dashboard containing the widget) and the `widgetOid` (the OID of the widget to fetch). This allows for
 * precise and dynamic fetching of widget models based on application needs.
 *
 * @example
 * How to use `useGetWidgetModel` within a Vue component to fetch and display widget information:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useGetWidgetModel } from './composables/useGetWidgetModel';
 *
 * const dashboardOid = ref('your_dashboard_oid');
 * const widgetOid = ref('your_widget_oid');
 *
 * const { data: widgetModel, isLoading, isError, error } = useGetWidgetModel({
 *   dashboardOid,
 *   widgetOid,
 * });
 * </script>
 * ```
 *
 * The composable returns an object with reactive properties that represent the state of the widget model fetch operation:
 * - `data`: The fetched widget model, which is `undefined` until the operation is successfully completed. The widget model
 *   contains detailed information about the widget, such as its configuration, data, and settings.
 * - `isLoading`: A boolean indicating whether the fetch operation is currently in progress.
 * - `isError`: A boolean indicating whether an error occurred during the fetch operation.
 * - `isSuccess`: A boolean indicating whether the fetch operation was successfully completed without any errors.
 * - `error`: An error object containing details about any errors that occurred during the fetch operation.
 *
 * This composable streamlines the process of fetching and managing Sisense widget models within Vue applications, providing
 * developers with a reactive and efficient way to integrate Sisense data visualizations and analytics.
 * @group Fusion Embed
 * @fusionEmbed
 */
export const useGetWidgetModel = (params: MaybeRefOrWithRefs<GetWidgetModelParams>) => {
  const { hasTrackedRef } = useTracking('useGetWidgetModel');
  const [widgetState, dispatch] = useReducer(dataLoadStateReducer<WidgetModel>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const context = getSisenseContext();

  const runGetWidgetModel = async (application: ClientApplication) => {
    try {
      dispatch({ type: 'loading' });
      const { dashboardOid, widgetOid } = toPlainObject(params);
      const data = await getWidgetModel(application.httpClient, dashboardOid, widgetOid);

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
      runGetWidgetModel(app);
    },
    { immediate: true },
  );

  return toRefs(widgetState.value);
};
