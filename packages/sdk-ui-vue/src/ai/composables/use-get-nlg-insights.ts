import { dataLoadStateReducer } from '@sisense/sdk-ui-preact';
import {
  type ChatRestApi,
  prepareGetNlgInsightsPayload,
  type UseGetNlgInsightsParams as UseGetNlgInsightsParamsPreact,
  type UseGetNlgInsightsState as UseGetNlgInsightsStatePreact,
} from '@sisense/sdk-ui-preact/ai';
import { toRefs, watch } from 'vue';

import { useTracking } from '../../composables/use-tracking.js';
import { useReducer } from '../../helpers/use-reducer.js';
import type { MaybeRefOrWithRefs, ToRefsExceptFns } from '../../types';
import { collectRefs, toPlainObject } from '../../utils.js';
import { getAiContext } from '../providers/index.js';

/**
 * Parameters of the {@link @sisense/sdk-ui-vue!useGetNlgInsights | `useGetNlgInsights`} composable.
 */
export interface UseGetNlgInsightsParams extends UseGetNlgInsightsParamsPreact {}

/**
 * State for {@link @sisense/sdk-ui-vue!useGetNlgInsights | `useGetNlgInsights`} composable.
 */
export interface UseGetNlgInsightsState
  extends ToRefsExceptFns<UseGetNlgInsightsStatePreact, 'refetch'> {}

/**
 * A Vue composable that fetches an analysis of the provided query using natural language generation (NLG).
 * Specifying a query is similar to providing parameters to a {@link @sisense/sdk-ui-vue!useExecuteQuery | `useExecuteQuery`} composable, using dimensions, measures, and filters.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { useGetNlgInsights, type GetNlgInsightsProps } from '@sisense/sdk-ui-vue/ai';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from '../assets/sample-retail-model';

const props: GetNlgInsightsProps = {
  dataSource: DM.DataSource.title,
  dimensions: [DM.DimProducts.CategoryName],
  measures: [measureFactory.sum(DM.DimProducts.Price)],
};
const { data: nlgInsights } = useGetNlgInsights(props);
</script>

<template>
  {{ nlgInsights }}
</template>
 * ```
 * @param params - {@link UseGetNlgInsightsParams}
 * @returns The composable load state that contains the status of the execution and a text summary result (data)
 * @group Generative AI
 */
export const useGetNlgInsights = (
  params: MaybeRefOrWithRefs<UseGetNlgInsightsParams>,
): UseGetNlgInsightsState => {
  useTracking('useGetNlgInsights');

  const [state, dispatch] = useReducer(dataLoadStateReducer<string | undefined>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const aiContext = getAiContext();

  const runGetNlgInsights = async (api: ChatRestApi) => {
    try {
      dispatch({ type: 'loading' });
      const payload = prepareGetNlgInsightsPayload(toPlainObject(params));
      const response = await api?.ai.getNlgInsights(payload);

      dispatch({ type: 'success', data: response?.data?.answer });
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
      runGetNlgInsights(api);
    },
    { immediate: true },
  );

  const refetch = () => {
    aiContext.value.api && runGetNlgInsights(aiContext.value.api);
  };

  return {
    ...toRefs(state.value),
    refetch,
  };
};
