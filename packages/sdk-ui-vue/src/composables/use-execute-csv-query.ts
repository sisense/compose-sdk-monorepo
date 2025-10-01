import { onBeforeUnmount, toRefs, watch } from 'vue';
import {
  type ExecuteCsvQueryParams,
  HookAdapter,
  useExecuteCsvQueryInternal,
  type CsvQueryState,
} from '@ethings-os/sdk-ui-preact';
import { createSisenseContextConnector } from '../helpers/context-connectors';
import type { MaybeRefOrWithRefs } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';
import { useRefState } from '../helpers/use-ref-state';

/**
 * A Vue composable function `useExecuteCsvQuery` that executes a CSV data query.

 * @param {MaybeRefOrWithRefs<ExecuteQueryParams>} params - The parameters for the query, supporting reactive Vue refs.
 * Includes details such as `dataSource`, `dimensions`, `measures`, `filters`, and more, allowing for comprehensive
 * query configuration. The `filters` parameter supports dynamic filtering based on user interaction or other application
 * state changes.
 *
 * @example
 * How to use `useExecuteCsvQuery` within a Vue component:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useExecuteCsvQuery } from '@ethings-os/sdk-ui-vue';
 *
 * const dataSource = ref('your_data_source_id');
 * // Set up other query parameters as needed (dimensions, measures, filters, etc.)
 *
 * const { data, isLoading, isError, isSuccess, error } = useExecuteCsvQuery({
 *   dataSource,
 *   dimensions: [...],
 *   measures: [...],
 *   filters: [...],
 *   config: { asDataStream: false },
 *   // Additional query parameters
 * });
 * </script>
 * ```
 *
 * The composable returns an object with the following reactive properties to manage the query state:
 * - `data`: The CSV data (string or Blob) returned from the query. It remains `undefined` until the query completes successfully.
 * - `isLoading`: Indicates if the query is in progress.
 * - `isError`: Indicates if an error occurred during query execution.
 * - `isSuccess`: Indicates if the query executed successfully without errors.
 * - `error`: Contains the error object if an error occurred during the query.
 *
 * This composable facilitates integrating Sisense data fetching into Vue applications, enabling developers
 * to easily manage query states and dynamically adjust query parameters based on application needs.
 * @group Queries
 */
export const useExecuteCsvQuery = (params: MaybeRefOrWithRefs<ExecuteCsvQueryParams>) => {
  useTracking('useExecuteCsvQuery');

  const hookAdapter = new HookAdapter(useExecuteCsvQueryInternal, [
    createSisenseContextConnector(),
  ]);
  const [queryState, setQueryState] = useRefState<CsvQueryState>({
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
