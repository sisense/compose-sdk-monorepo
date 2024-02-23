/* eslint-disable max-lines */
import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Chat, ChatContext, ChatMessage, ChatResponse } from './types';
import { useChatApi } from './chat-api-provider';
import { useChatConfig } from '../chat-config';
import { UNKNOWN_ERROR } from './errors';

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
export const useMaybeCreateChat = (contextId: string | undefined, shouldCreate: boolean): void => {
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
};

/**
 * @internal
 */
export const useGetChatHistory = (id: string | undefined) => {
  const api = useChatApi();

  const { data, isLoading } = useQuery({
    queryKey: ['getChatById', id, api],
    queryFn: () => (id ? api?.ai.chat.getById(id) : undefined),
    select: (data) => data?.chatHistory,
    enabled: !!api && !!id,
  });

  return {
    data,
    isLoading,
  };
};

/**
 * @internal
 */
export const useClearChatHistory = (chatId: string | undefined) => {
  const queryClient = useQueryClient();
  const api = useChatApi();

  return useMutation({
    mutationFn: async () => {
      if (!api || !chatId) {
        return;
      }

      return api.ai.chat.clearHistory(chatId);
    },
    onError: (error) => {
      if (error instanceof Error) {
        console.error('Error when clearing history:', error.message);
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['getChatById', chatId]),
  });
};

const mapToChatMessage = (response: ChatResponse): ChatMessage => {
  if (response.responseType === 'Text') {
    return {
      content: response.data.answer,
      role: 'assistant',
    };
  }

  return {
    content: JSON.stringify(response.data),
    role: 'assistant',
    type: 'nlq',
  };
};

// eslint-disable-next-line max-lines-per-function
export const useSendChatMessage = (chatId: string | undefined) => {
  const queryClient = useQueryClient();
  const appendToHistory = useCallback(
    (messageObj: ChatMessage) => {
      if (!chatId) {
        return;
      }
      queryClient.setQueriesData(['getChatById', chatId], (old: Chat | undefined) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          chatHistory: [...old.chatHistory, messageObj],
        };
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
          content: UNKNOWN_ERROR,
          role: 'assistant',
          type: 'Text',
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
