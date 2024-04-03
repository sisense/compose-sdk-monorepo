import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useChatApi } from './chat-api-provider';
import type { ChatMessage } from './types';

export const CHAT_HISTORY_QUERY_KEY = 'chatHistory';

const useFetchChatHistory = (id: string | undefined) => {
  const api = useChatApi();

  return useQuery({
    queryKey: [CHAT_HISTORY_QUERY_KEY, id, api],
    queryFn: async () => {
      if (!api || !id) {
        return;
      }

      const chatObj = await api.ai.chat.getById(id);
      return chatObj.chatHistory;
    },
    enabled: !!api && !!id,
  });
};

/**
 * Hook that calls the clear history API and updates the cache.
 *
 * @internal
 */
export const useClearChatHistory = (chatId: string | undefined) => {
  const api = useChatApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!api || !chatId) {
        return;
      }

      return api.ai.chat.clearHistory(chatId);
    },
    onError: (error) => {
      console.error('Error when clearing history:', error);
    },
    onSettled: () => {
      if (!chatId) {
        return;
      }

      queryClient.setQueriesData<ChatMessage[]>([CHAT_HISTORY_QUERY_KEY, chatId], []);
    },
  });
};

/**
 * Hook that calls the get chat API and handles errors by clearing the history.
 *
 * @internal
 */
export const useChatHistory = (chatId: string | undefined) => {
  const { data: history, isLoading, isError } = useFetchChatHistory(chatId);
  const { mutate: clearHistory } = useClearChatHistory(chatId);

  useEffect(() => {
    if (isError) {
      clearHistory();
    }
  }, [isError, clearHistory]);

  return {
    history,
    isLoading,
    isError,
  };
};
