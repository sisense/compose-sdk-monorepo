import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useChatApi } from './chat-api-context';
import type { ChatContext } from './types';

/**
 * @internal
 */
export const useDataTopics = () => {
  const api = useChatApi();

  const { data, isLoading } = useQuery({
    queryKey: ['getDataTopics', api],
    queryFn: async () => {
      if (!api) {
        return;
      }

      const models = (await api.getDataModels()).map(
        (model): ChatContext => ({
          id: model.oid,
          name: model.title,
          type: 'datamodel',
          description: '',
        }),
      );

      // The "/api/v2/perspectives" API returns both perspectives and data
      // models. Filter out the data models based on the "isDefault" property.
      const perspectivesWithParents = await api.getPerspectives();
      const perspectivesWithoutParent = perspectivesWithParents.filter(
        (perspective) => !perspective.isDefault,
      );
      const perspectives = perspectivesWithoutParent.map(
        (perspective): ChatContext => ({
          id: perspective.oid,
          name: perspective.name,
          type: 'perspective',
          description: perspective.description,
        }),
      );

      return [...models, ...perspectives];
    },
    enabled: !!api,
  });

  return { data, isLoading };
};

/**
 * @internal
 */
export const useChats = () => {
  const api = useChatApi();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['getAllChats', api],
    queryFn: () => api?.ai.chat.getAll(),
    enabled: !!api,
  });

  return {
    data: data ?? [],
    isLoading,
    refetch,
  };
};

/**
 * @internal
 */
export const useChat = (id: string | undefined) => {
  const api = useChatApi();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['getChatById', api, id],
    queryFn: () => (id ? api?.ai.chat.getById(id) : undefined),
    enabled: !!api && !!id,
  });

  return {
    data,
    isLoading,
    refetch: useCallback(() => {
      refetch();
    }, [refetch]),
  };
};

/**
 * Parameters for {@link useQueryRecommendations} hook.
 *
 * @internal
 */
export interface UseGetQueryRecommendationsParams {
  /** Data model title or perspective title */
  contextTitle: string;
}

/**
 * Fetch recommended questions for a data model or perspective.
 *
 * @param params - {@link UseQueryRecommendationsParams}
 * @returns An array of questions
 * @internal
 */
export function useGetQueryRecommendations(params: UseGetQueryRecommendationsParams) {
  const DEFAULT_NUM_OF_RECOMMENDATIONS = 4;

  const { contextTitle } = params;

  const api = useChatApi();

  const { data, isLoading } = useQuery({
    queryKey: ['getQueryRecommendations', api, contextTitle],
    queryFn: () =>
      api?.ai.getQueryRecommendations(contextTitle, {
        numOfRecommendations: DEFAULT_NUM_OF_RECOMMENDATIONS,
      }),
    select: (data) => data?.map((r) => r.nlqPrompt),
    enabled: !!api,
  });

  return { data: data ?? [], isLoading };
}

/**
 * Parameters for {@link useNlgQueryResult} hook.
 *
 * @internal
 */
export interface UseGetNlgQueryResultParams {
  /** The data source that the JAQL metadata targets - e.g. `Sample ECommerce` */
  dataSource: string;

  /** The metadata that composes the JAQL to be analyzed */
  metadata: unknown[];

  /**
   * Boolean flag to enable/disable API call by default
   *
   * If not specified, the default value is `true`
   */
  enabled?: boolean;
}

/**
 * Fetch an analysis of the provided JAQL.
 *
 * @param params - {@link UseNlgQueryResultParams}
 * @returns A response object containing a text summary
 * @internal
 */
export const useGetNlgQueryResult = (params: UseGetNlgQueryResultParams) => {
  const { dataSource, metadata, enabled = true } = params;

  const api = useChatApi();

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ['getNlgQueryResult', dataSource, metadata],
    queryFn: () =>
      api?.ai.getNlgQueryResult({
        style: 'Large',
        jaql: {
          datasource: {
            title: dataSource,
          },
          metadata,
        },
      }),
    select: (data) => data?.data?.answer,
    enabled: !!api && enabled,
  });

  return {
    data,
    isError,
    isLoading,
    refetch: useCallback(() => {
      refetch();
    }, [refetch]),
  };
};
