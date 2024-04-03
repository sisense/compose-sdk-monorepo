import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ChatContext, ChatMessage, ChatResponse } from './types';
import { useChatApi } from './chat-api-provider';
import { useChatConfig } from '../chat-config';
import { UNEXPECTED_CHAT_RESPONSE_ERROR } from './errors';
import { CHAT_HISTORY_QUERY_KEY } from './chat-history';

/**
 * @internal
 */
export const useGetDataTopics = () => {
  const api = useChatApi();

  const { data, isLoading, fetchStatus } = useQuery({
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

  return { data, isLoading, fetchStatus };
};

/**
 * @internal
 */
export const useGetAllChats = () => {
  const api = useChatApi();

  const { data, isLoading } = useQuery({
    queryKey: ['getAllChats', api],
    queryFn: () => api?.ai.chat.getAll(),
    enabled: !!api,
  });

  return {
    data: data ?? [],
    isLoading,
  };
};

/**
 * @internal
 */
export const useMaybeCreateChat = (contextId: string | undefined, shouldCreate: boolean) => {
  const queryClient = useQueryClient();
  const api = useChatApi();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!api || !contextId) {
        return;
      }

      return api.ai.chat.create(contextId);
    },
    onSuccess: () => queryClient.invalidateQueries(['getAllChats']),
  });

  useEffect(() => {
    if (shouldCreate && mutation.isIdle) {
      mutation.mutate();
    }
  }, [shouldCreate, mutation]);

  return mutation;
};

const mapToChatMessage = (response: ChatResponse): ChatMessage => {
  // TODO: Remove this in the next release.
  response.responseType = response.responseType.toLowerCase() as ChatResponse['responseType'];

  switch (response.responseType) {
    case 'nlq':
      return {
        content: JSON.stringify(response.data),
        role: 'assistant',
        type: 'nlq',
      };
    case 'text':
    case 'error':
      return {
        content: response.data.answer,
        role: 'assistant',
      };
    default:
      throw Error(`Received unknown responseType, raw response=${JSON.stringify(response)}`);
  }
};

// eslint-disable-next-line max-lines-per-function
export const useSendChatMessage = (chatId: string | undefined) => {
  const queryClient = useQueryClient();
  const appendToHistory = useCallback(
    (messageObj: ChatMessage) => {
      if (!chatId) {
        return;
      }
      queryClient.setQueriesData<ChatMessage[]>([CHAT_HISTORY_QUERY_KEY, chatId], (old) => {
        return old ? [...old, messageObj] : old;
      });
    },
    [queryClient, chatId],
  );

  const { enableFollowupQuestions } = useChatConfig();
  const api = useChatApi();
  const { mutate, isLoading } = useMutation({
    mutationFn: async (message: string) => {
      if (!api || !chatId) {
        return;
      }

      return api.ai.chat.post(chatId, {
        text: message,
        options: { enableFollowup: enableFollowupQuestions },
      });
    },
    onMutate: (message) => {
      appendToHistory({
        content: message,
        role: 'user',
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        console.error('Error when sending message:', error.message);
        appendToHistory({
          content: UNEXPECTED_CHAT_RESPONSE_ERROR,
          role: 'assistant',
        });
      }
    },
    onSuccess: (response) => {
      if (!response) {
        return;
      }

      appendToHistory(mapToChatMessage(response));
    },
  });

  return { mutate, isLoading };
};
