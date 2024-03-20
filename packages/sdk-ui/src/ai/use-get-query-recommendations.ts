/* eslint-disable max-lines */
import { withTracking } from '@/decorators/hook-decorators';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useChatApi } from './api/chat-api-provider';
import { QueryRecommendation } from './api/types';
import { useChatConfig } from './chat-config';

/**
 * Parameters for {@link useGetQueryRecommendations} hook.
 */
export interface UseGetQueryRecommendationsParams {
  /** Data model title or perspective title */
  contextTitle: string;

  /**
   * Number of recommendations that should be returned
   *
   * If not specified, the default value is `4`
   */
  count?: number;
}

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
  data: QueryRecommendation[];
  /** The error if any occurred */
  error: unknown;
  /** Callback to trigger a refetch of the data */
  refetch: () => void;
}

export const useGetQueryRecommendationsInternal = (
  params: UseGetQueryRecommendationsParams,
): UseGetQueryRecommendationsState => {
  const { contextTitle, count } = params;

  const api = useChatApi();
  const { numOfRecommendations } = useChatConfig();

  const finalCount = count ?? numOfRecommendations;

  const { isLoading, isError, isSuccess, data, error, refetch } = useQuery({
    queryKey: ['getQueryRecommendations', contextTitle, finalCount, api],
    queryFn: () =>
      api?.ai.getQueryRecommendations(contextTitle, {
        numOfRecommendations: finalCount,
      }),
    enabled: !!api,
  });

  return {
    isLoading,
    isError,
    isSuccess,
    data: data ?? [],
    error,
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
 * ::: warning Note
 * This hook is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
 * :::
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
 * @param params - {@link UseGetQueryRecommendationsParams}
 * @returns An array of objects, each containing recommended question text and its corresponding JAQL
 * @group Generative AI
 * @beta
 */
export const useGetQueryRecommendations = withTracking('useGetQueryRecommendations')(
  useGetQueryRecommendationsInternal,
);
