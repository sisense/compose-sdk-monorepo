import { dataLoadStateReducer } from '@sisense/sdk-ui-preact';
import {
  type ChatRestApi,
  prepareGetNlqResultPayload,
  type UseGetNlqResultParams as UseGetNlqResultParamsPreact,
  type UseGetNlqResultState as UseGetNlqResultStatePreact,
  widgetComposer,
} from '@sisense/sdk-ui-preact/ai';
import { type Ref, toRefs, watch } from 'vue';

import type { WidgetProps } from '../../components/widgets';
import { useTracking } from '../../composables/use-tracking.js';
import { useReducer } from '../../helpers/use-reducer.js';
import type { MaybeRefOrWithRefs, ToRefsExceptFns } from '../../types';
import { collectRefs, toPlainObject } from '../../utils.js';
import { getAiContext } from '../providers/index.js';

/**
 * Parameters for {@link @sisense/sdk-ui-vue!useGetNlqResult | `useGetNlqResult`} composable.
 */
export interface UseGetNlqResultParams extends UseGetNlqResultParamsPreact {}

/**
 * State for {@link @sisense/sdk-ui-vue!useGetNlqResult | `useGetNlqResult`} composable.
 */
export interface UseGetNlqResultState
  extends ToRefsExceptFns<Omit<UseGetNlqResultStatePreact, 'data'>, 'refetch'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!UseGetNlqResultState.data}
   */
  data: Ref<WidgetProps | undefined>;
}

/**
 * A Vue composable that enables natural language query (NLQ) against a data model or perspective.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { ChartWidget } from '@sisense/sdk-ui-vue';
import { useGetNlqResult, type UseGetNlqResultParams } from '@sisense/sdk-ui-vue/ai';

const params: UseGetNlqResultParams = {
  dataSource: 'Sample Retail',
  query: 'Show me the lowest product prices by country'
};
const { data: nlqResult } = useGetNlqResult(params);
</script>

<template>
  <ChartWidget v-bind="nlqResult" />
</template>
 * ```
 * @param params - {@link UseGetNlqResultParams}
 * @returns The composable NLQ load state that contains the status of the execution, the result (data) as WidgetProps
 * @group Generative AI
 * @beta
 */
export const useGetNlqResult = (
  params: MaybeRefOrWithRefs<UseGetNlqResultParams>,
): UseGetNlqResultState => {
  useTracking('useGetNlqResult');

  const [state, dispatch] = useReducer(dataLoadStateReducer<WidgetProps | undefined>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const aiContext = getAiContext();

  const runGetNlqResult = async (api: ChatRestApi) => {
    try {
      dispatch({ type: 'loading' });
      const plainParams = toPlainObject(params);
      const { enableAxisTitlesInWidgetProps } = plainParams;
      const { contextTitle, request } = prepareGetNlqResultPayload(plainParams);
      const nlqResult = await api?.ai.getNlqResult(contextTitle, request);

      const widgetProps: WidgetProps | undefined = nlqResult
        ? widgetComposer.toWidgetProps(nlqResult, {
            useCustomizedStyleOptions: enableAxisTitlesInWidgetProps || false,
          })
        : undefined;

      dispatch({ type: 'success', data: widgetProps });
    } catch (error) {
      dispatch({ type: 'error', error: error as Error });
    }
  };

  watch(
    [...collectRefs(params), aiContext],
    () => {
      const { api } = aiContext.value;
      const { enabled } = toPlainObject(params);
      const isEnabled = enabled === undefined || enabled === true;
      if (!api || !isEnabled) return;
      runGetNlqResult(api);
    },
    { immediate: true },
  );

  const refetch = () => {
    aiContext.value.api && runGetNlqResult(aiContext.value.api);
  };

  return {
    ...toRefs(state.value),
    refetch,
  };
};
