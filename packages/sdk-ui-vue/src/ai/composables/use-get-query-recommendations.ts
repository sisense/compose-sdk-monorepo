import { dataLoadStateReducer } from '@sisense/sdk-ui-preact';
import {
  type ChatRestApi,
  DEFAULT_RECOMMENDATIONS_COUNT,
  type QueryRecommendation as QueryRecommendationPreact,
  type UseGetQueryRecommendationsParams as UseGetQueryRecommendationsParamsPreact,
  type UseGetQueryRecommendationsState as UseGetQueryRecommendationsStatePreact,
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
 * Parameters for {@link @sisense/sdk-ui-vue!useGetQueryRecommendations | `useGetQueryRecommendations`} composable.
 */
export interface UseGetQueryRecommendationsParams extends UseGetQueryRecommendationsParamsPreact {}

/**
 * State for {@link @sisense/sdk-ui-vue!useGetQueryRecommendations | `useGetQueryRecommendations`} composable.
 */
export interface UseGetQueryRecommendationsState
  extends ToRefsExceptFns<Omit<UseGetQueryRecommendationsStatePreact, 'data'>, 'refetch'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!UseGetQueryRecommendationsState.data}
   */
  data: Ref<QueryRecommendation[] | undefined>;
}

/**
 * {@inheritDoc @sisense/sdk-ui!QueryRecommendation}
 */
export interface QueryRecommendation extends Omit<QueryRecommendationPreact, 'widgetProps'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!QueryRecommendation.widgetProps}
   */
  widgetProps?: WidgetProps;
}

/**
 * A Vue composable that fetches recommended questions for a data model or perspective.
 *
 * This composable includes the same code that fetches the initial suggested questions in the chatbot.
 *
 * @example
 * ```vue
<script setup lang="ts">
import {
  useGetQueryRecommendations,
  type UseGetQueryRecommendationsParams,
} from '@sisense/sdk-ui-vue/ai';

const params: UseGetQueryRecommendationsParams = {
  contextTitle: 'Sample Retail',
  count: 3,
};
const { data: recommendations = [] } = useGetQueryRecommendations(params);
</script>

<template>
  <ul>
    <li v-for="r in recommendations" :key="r.nlqPrompt">
      {{ r.nlqPrompt }}
    </li>
  </ul>
</template>
 * ```
 * @param params - {@link UseGetQueryRecommendationsParams}
 * @returns The composable load state that contains the status of the execution and recommendations result (data) with recommended question text and its corresponding `widgetProps`
 * @group Generative AI
 * @beta
 */
export const useGetQueryRecommendations = (
  params: MaybeRefOrWithRefs<UseGetQueryRecommendationsParams>,
): UseGetQueryRecommendationsState => {
  useTracking('useGetQueryRecommendations');

  const [state, dispatch] = useReducer(dataLoadStateReducer<QueryRecommendation[]>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const aiContext = getAiContext();

  const runGetQueryRecommendations = async (api: ChatRestApi) => {
    try {
      dispatch({ type: 'loading' });
      const { contextTitle, count, enableAxisTitlesInWidgetProps, customPrompt } =
        toPlainObject(params);
      const recCount = count ?? DEFAULT_RECOMMENDATIONS_COUNT;
      const rawRecommendations = await api?.ai.getQueryRecommendations(contextTitle, {
        numOfRecommendations: recCount,
        ...(customPrompt ? { userPrompt: customPrompt } : undefined),
      });

      const recommendations =
        rawRecommendations?.map((recommendation: QueryRecommendation) => ({
          ...recommendation,
          widgetProps: widgetComposer.toWidgetProps(recommendation, {
            useCustomizedStyleOptions: enableAxisTitlesInWidgetProps,
          }),
        })) || [];

      dispatch({ type: 'success', data: recommendations });
    } catch (error) {
      dispatch({ type: 'error', error: error as Error });
    }
  };

  watch(
    [...collectRefs(params), aiContext],
    () => {
      const { api } = aiContext.value;
      const { enabled, count } = toPlainObject(params);
      const recCount = count ?? DEFAULT_RECOMMENDATIONS_COUNT;
      const isEnabled = (enabled === undefined || enabled === true) && recCount > 0;
      if (!api || !isEnabled) return;
      runGetQueryRecommendations(api);
    },
    { immediate: true },
  );

  const refetch = () => {
    aiContext.value.api && runGetQueryRecommendations(aiContext.value.api);
  };

  return {
    ...toRefs(state.value),
    refetch,
  };
};
