import { toRefs, watch } from 'vue';
import { getFilterListAndRelations } from '@sisense/sdk-data';
import {
  ClientApplication,
  executeQuery,
  queryStateReducer,
  type ExecuteQueryParams,
} from '@sisense/sdk-ui-preact';
import { getSisenseContext } from '../providers/sisense-context-provider';
import { useReducer } from '../helpers/use-reducer';
import type { MaybeWithRefs } from '../types';
import { collectRefs, toPlainValue } from '../utils';
import { useTracking } from './use-tracking';

/**
 * A Vue composable function `useExecuteQuery` for executing Sisense queries with flexible parameters.
 * It handles query execution, including loading, error, and success states, and enables dynamic query configuration
 * through reactive parameters. This composable is particularly useful for applications requiring data from Sisense
 * analytics, offering a reactive and declarative approach to data fetching and state management.
 *
 * @param {MaybeWithRefs<ExecuteQueryParams>} params - The parameters for the query, supporting reactive Vue refs.
 * Includes details such as `dataSource`, `dimensions`, `measures`, `filters`, and more, allowing for comprehensive
 * query configuration. The `filters` parameter supports dynamic filtering based on user interaction or other application
 * state changes.
 *
 * @example
 * How to use `useExecuteQuery` within a Vue component:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useExecuteQuery } from './composables/useExecuteQuery';
 *
 * const dataSource = ref('your_data_source_id');
 * // Set up other query parameters as needed (dimensions, measures, filters, etc.)
 *
 * const { data, isLoading, isError, isSuccess, error } = useExecuteQuery({
 *   dataSource,
 *   dimensions: [...],
 *   measures: [...],
 *   filters: [...],
 *   // Additional query parameters
 * });
 * </script>
 * ```
 *
 * The composable returns an object with the following reactive properties to manage the query state:
 * - `data`: The data returned from the query. It remains `undefined` until the query completes successfully.
 * - `isLoading`: Indicates if the query is in progress.
 * - `isError`: Indicates if an error occurred during query execution.
 * - `isSuccess`: Indicates if the query executed successfully without errors.
 * - `error`: Contains the error object if an error occurred during the query.
 *
 * This composable facilitates integrating Sisense data fetching into Vue applications, enabling developers
 * to easily manage query states and dynamically adjust query parameters based on application needs.
 * @group Queries
 */
export const useExecuteQuery = (params: MaybeWithRefs<ExecuteQueryParams>) => {
  const [queryState, dispatch] = useReducer(queryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  // todo: retrive app ref directly from context
  const context = getSisenseContext();
  const { hasTrackedRef } = useTracking('useExecuteQuery');

  const runExecuteQuery = async (application: ClientApplication) => {
    try {
      const {
        dataSource,
        dimensions,
        measures,
        filters,
        highlights,
        count,
        offset,
        onBeforeQuery,
      } = params;
      const { filters: filterList, relations: filterRelations } = getFilterListAndRelations(
        toPlainValue(filters),
      );

      dispatch({ type: 'loading' });

      const data = await executeQuery(
        {
          dataSource: toPlainValue(dataSource),
          dimensions: toPlainValue(dimensions),
          measures: toPlainValue(measures),
          filters: filterList,
          filterRelations,
          highlights: toPlainValue(highlights),
          count: toPlainValue(count),
          offset: toPlainValue(offset),
        },
        application,
        { onBeforeQuery: toPlainValue(onBeforeQuery) },
      );

      dispatch({ type: 'success', data });
    } catch (error) {
      dispatch({ type: 'error', error: error as Error });
    }
  };

  watch(
    [...collectRefs(params), context],
    () => {
      const { app } = context.value;
      const enabled = toPlainValue(params.enabled);
      const isEnabled = enabled === undefined || enabled === true;
      if (!app || !isEnabled) return;
      runExecuteQuery(app);
    },
    { immediate: true },
  );

  return toRefs(queryState.value);
};
