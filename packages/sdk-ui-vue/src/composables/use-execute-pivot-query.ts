import {
  type ExecutePivotQueryParams,
  HookAdapter,
  type PivotQueryState,
  useExecutePivotQueryInternal,
} from '@sisense/sdk-ui-preact';
import { onBeforeUnmount, toRefs, watch } from 'vue';

import { createSisenseContextConnector } from '../helpers/context-connectors';
import { useRefState } from '../helpers/use-ref-state';
import type { MaybeRefOrWithRefs } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

/**
 * A Vue composable function `useExecutePivotQuery` that executes a pivot data query.

 * @param {MaybeRefOrWithRefs<ExecutePivotQueryParams>} params - The parameters for the query, supporting reactive Vue refs.
 * Includes details such as `dataSource`, `dimensions`, `rows`, `columns`, `values`, `filters` and more, allowing for comprehensive
 * query configuration. The `filters` parameter supports dynamic filtering based on user interaction or other application
 * state changes.
 *
 * @example
 * How to use `useExecutePivotQuery` within a Vue component:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useExecutePivotQuery } from '@sisense/sdk-ui-vue';
 *
 * const dataSource = ref('your_data_source_id');
 * // Set up other query parameters as needed (dimensions, rows, columns, values, filters, etc.)
 *
 * const { data, isLoading, isError, isSuccess, error } = useExecutePivotQuery({
 *   dataSource,
 *   columns: [...],
 *   rows: [...],
 *   values: [...],
 *   filters: [...],
 *   // Additional query parameters
 * });
 * </script>
 * ```
 *
 * The composable returns an object with the following reactive properties to manage the query state:
 * - `data`: The Pivot query result data set returned from the query. It remains `undefined` until the query completes successfully.
 * - `isLoading`: Indicates if the query is in progress.
 * - `isError`: Indicates if an error occurred during query execution.
 * - `isSuccess`: Indicates if the query executed successfully without errors.
 * - `error`: Contains the error object if an error occurred during the query.
 *
 * This composable facilitates integrating Sisense data fetching into Vue applications, enabling developers
 * to easily manage query states and dynamically adjust query parameters based on application needs.
 * @group Queries
 */
export const useExecutePivotQuery = (params: MaybeRefOrWithRefs<ExecutePivotQueryParams>) => {
  useTracking('useExecutePivotQuery');

  const hookAdapter = new HookAdapter(useExecutePivotQueryInternal, [
    createSisenseContextConnector(),
  ]);
  const [queryState, setQueryState] = useRefState<PivotQueryState>({
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  hookAdapter.subscribe((result) => {
    setQueryState(result);
  });

  hookAdapter.run(toPlainObject(params));

  watch([...collectRefs(params)], () => {
    hookAdapter.run(toPlainObject(params));
  });

  onBeforeUnmount(() => {
    hookAdapter.destroy();
  });

  return toRefs(queryState.value);
};
