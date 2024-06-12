import { getFilterListAndRelations } from '@sisense/sdk-data';
import type {
  ClientApplication,
  ExecuteQueryByWidgetIdParams,
  QueryByWidgetIdState,
} from '@sisense/sdk-ui-preact';
import { executeQueryByWidgetId, queryStateReducer } from '@sisense/sdk-ui-preact';
import { getSisenseContext } from '../providers/sisense-context-provider';
import { ref, toRefs, watch, type ToRefs } from 'vue';
import { collectRefs, toPlainValue, toPlainObject } from '../utils';
import { useReducer } from '../helpers/use-reducer';
import { useTracking } from './use-tracking';
import type { MaybeRefOrWithRefs } from '../types';

/**
 * A Vue composable function `useExecuteQueryByWidgetId` for executing queries by widget ID using the Sisense SDK.
 * It simplifies the process of fetching data related to a specific widget based on provided parameters and manages
 * the query's loading, success, and error states. This composable integrates with the Sisense application context
 * to perform queries and handle their results within Vue components.
 *
 * @param {ExecuteQueryByWidgetIdParams} params - Parameters for executing the query, including widget ID, filters,
 * and other relevant query options. The `filters` parameter allows for specifying dynamic filters for the query.
 *
 * @example
 * Here's how to use `useExecuteQueryByWidgetId` within a Vue component:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useExecuteQueryByWidgetId } from './composables/useExecuteQueryByWidgetId';
 *
 * const widgetId = ref('your_widget_id_here');
 * const filters = ref([...]); // Define filters if necessary
 *
 * const { data, isLoading, isError, isSuccess, error } = useExecuteQueryByWidgetId({
 *   widgetId,
 *   filters,
 *   enabled: true, // Optional: Use to enable/disable the query execution
 * });
 * </script>
 * ```
 *
 * This composable returns an object containing reactive state management properties for the query:
 * - `data`: The result of the query, undefined until the query completes successfully.
 * - `isLoading`: A boolean indicating if the query is currently loading.
 * - `isError`: A boolean indicating if an error occurred during the query execution.
 * - `isSuccess`: A boolean indicating if the query executed successfully.
 * - `error`: An Error object containing the error details if an error occurred.
 * - `query`: The query object returned by the SDK, useful for debugging or advanced handling.
 *
 * Utilizing this composable allows for declarative and reactive handling of widget-specific queries within Vue applications,
 * facilitating easier data fetching and state management with the Sisense SDK.
 *
 * @group Fusion Embed
 * @fusionEmbed
 */
export const useExecuteQueryByWidgetId = (
  params: MaybeRefOrWithRefs<ExecuteQueryByWidgetIdParams>,
) => {
  const query = ref<QueryByWidgetIdState['query']>(undefined);
  const { hasTrackedRef } = useTracking('useExecuteQueryByWidgetId');
  const [queryState, dispatch] = useReducer(queryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const context = getSisenseContext();

  const runExecuteQueryByWidgetId = async (application: ClientApplication) => {
    try {
      dispatch({ type: 'loading' });
      const { filters, ...rest } = toPlainObject(params);
      const { filters: filterList } = getFilterListAndRelations(toPlainValue(filters));
      const { data, query: resQuery } = await executeQueryByWidgetId({
        ...rest,
        filters: filterList,
        app: application!,
      });

      dispatch({ type: 'success', data });
      query.value = resQuery;
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
      runExecuteQueryByWidgetId(app);
    },
    { immediate: true },
  );

  return {
    ...toRefs(queryState.value),
    query: query,
  } as ToRefs<QueryByWidgetIdState>;
};
