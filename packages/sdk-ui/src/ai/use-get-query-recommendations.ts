import { withTracking } from '@/decorators/hook-decorators';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useChatApi } from './api/chat-api-provider';
import { QueryRecommendation } from './api/types';
import { widgetComposer } from '@/analytics-composer';
import { HookEnableParam } from '@/common/hooks/types';

/** @internal */
export const DEFAULT_RECOMMENDATIONS_COUNT = 4;

export interface GetQueryRecommendationsParams {
  /** Data model title or perspective title */
  contextTitle: string;

  /**
   * Number of recommendations that should be returned
   *
   * If not specified, the default value is `4`
   */
  count?: number;

  /**
   * Enable suggested axis titles in generated widget
   *
   * If not specified, the default value is `false`
   *
   * @internal
   */
  enableAxisTitlesInWidgetProps?: boolean;

  /**
   * Pass a custom prompt to AI when generating query recommendations
   *
   * e.g. "Focus on age range"
   *
   */
  customPrompt?: string;
}

/**
 * Parameters for {@link useGetQueryRecommendations} hook.
 */
export interface UseGetQueryRecommendationsParams
  extends GetQueryRecommendationsParams,
    HookEnableParam {}

/**
 * State for {@link useGetQueryRecommendations} hook.
 */
export interface UseGetQueryRecommendationsState {
  /** Whether the data fetching is loading */
  isLoading: boolean;
  /** Whether the data fetching has failed */
  isError: boolean;
  /** Whether the data fetching has succeeded */
  isSuccess: boolean;
  /** The result data */
  data: QueryRecommendation[] | undefined;
  /** The error if any occurred */
  error: unknown;
  /** Callback to trigger a refetch of the data */
  refetch: () => void;
}

/**
 * @param params - {@link UseGetQueryRecommendationsParams}
 * @internal
 */
export const useGetQueryRecommendationsInternal = (
  params: UseGetQueryRecommendationsParams,
): UseGetQueryRecommendationsState => {
  const { contextTitle, count, enableAxisTitlesInWidgetProps, enabled, customPrompt } = params;

  const api = useChatApi();

  const recCount = count ?? DEFAULT_RECOMMENDATIONS_COUNT;

  const shouldGetRecommendations = (enabled === undefined || enabled === true) && recCount > 0;

  const {
    isLoading,
    isError,
    isSuccess,
    data: rawRecommendations,
    error,
    refetch,
  } = useQuery({
    queryKey: ['getQueryRecommendations', contextTitle, recCount, api],
    queryFn: () =>
      api?.ai.getQueryRecommendations(contextTitle, {
        numOfRecommendations: recCount,
        ...(customPrompt ? { userPrompt: customPrompt } : null),
      }),
    enabled: !!api && shouldGetRecommendations,
  });

  const recommendations = useMemo(() => {
    return rawRecommendations?.map((recommendation: QueryRecommendation) => ({
      ...recommendation,
      widgetProps: recommendation.jaql
        ? widgetComposer.toWidgetProps(recommendation, {
            useCustomizedStyleOptions: enableAxisTitlesInWidgetProps,
          })
        : undefined,
    }));
  }, [rawRecommendations, enableAxisTitlesInWidgetProps]);

  return {
    isLoading: shouldGetRecommendations ? isLoading : false,
    isError: isError,
    isSuccess: isSuccess,
    data: recommendations ?? undefined,
    error: error,
    refetch: useCallback(() => {
      refetch();
    }, [refetch]),
  };
};

/**
 * React hook that fetches recommended questions for a data model or perspective.
 *
 * This hook includes the same code that fetches the initial suggested questions in the chatbot.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetQueryRecommendations({
 *   contextTitle: 'Sample ECommerce',
 * });
 *
 * if (isLoading) {
 *   return <div>Loading recommendations</div>;
 * }
 *
 * return (
 *   <ul>
 *     {data.map((item, index) => (
 *       <li key={index}>{item.nlqPrompt}</li>
 *     ))}
 *   </ul>
 * );
 * ```
 * @returns An array of objects, each containing recommended question text and its corresponding `widgetProps`
 * @group Generative AI
 * @beta
 */
export const useGetQueryRecommendations = withTracking('useGetQueryRecommendations')(
  useGetQueryRecommendationsInternal,
);
