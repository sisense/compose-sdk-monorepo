import {
  type CustomWidgetQueryState,
  type ExecuteCustomWidgetQueryParams as ExecuteCustomWidgetQueryParamsPreact,
  HookAdapter,
  useExecuteCustomWidgetQueryInternal,
} from '@sisense/sdk-ui-preact';
import { onBeforeUnmount, toRefs, watch } from 'vue';

import { createSisenseContextConnector } from '../helpers/context-connectors';
import { useRefState } from '../helpers/use-ref-state';
import type { MaybeRefOrWithRefs } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

export type { CustomWidgetQueryState };

/**
 * Parameters for executing a query for a custom widget.
 */
export interface ExecuteCustomWidgetQueryParams extends ExecuteCustomWidgetQueryParamsPreact {}

/**
 * Vue composable that takes a custom widget component's props and executes a data query.
 *
 * @example
 * ```vue
 * <script setup>
 * import {
 *   useExecuteCustomWidgetQuery,
 *   type CustomWidgetComponentProps,
 *   type ExecuteCustomWidgetQueryParams,
 * } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 *
 * const props: CustomWidgetComponentProps = {
 *   dataSource: DM.DataSource,
 *   dataOptions: {
 *     category: [DM.Commerce.Gender],
 *     value: [DM.Measures.SumRevenue],
 *   },
 *   styleOptions: {},
 * };
 *
 * const params: ExecuteCustomWidgetQueryParams = {
 *   ...props,
 *   count: 10,
 *   offset: 0,
 * };
 *
 * const { data, isLoading, isError, isSuccess } = useExecuteCustomWidgetQuery(params);
 * </script>
 * ```
 *
 * @param params - Custom widget component props containing data source, data options, filters, etc.
 * @returns Query state object with data, loading, and error states
 * @group Queries
 */
export const useExecuteCustomWidgetQuery = (
  params: MaybeRefOrWithRefs<ExecuteCustomWidgetQueryParams>,
) => {
  useTracking('useExecuteCustomWidgetQuery');

  const hookAdapter = new HookAdapter(useExecuteCustomWidgetQueryInternal, [
    createSisenseContextConnector(),
  ]);

  const [queryState, setQueryState] = useRefState<CustomWidgetQueryState>({
    data: undefined,
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
  });

  hookAdapter.subscribe((result) => {
    setQueryState(result);
  });

  hookAdapter.run(toPlainObject(params));

  // Watch for changes in reactive parameters
  watch([...collectRefs(params)], () => {
    hookAdapter.run(toPlainObject(params));
  });

  // Cleanup on unmount
  onBeforeUnmount(() => {
    hookAdapter.destroy();
  });

  return toRefs(queryState.value);
};
