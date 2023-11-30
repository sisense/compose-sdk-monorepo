import { useCallback, useEffect, useMemo, useState } from 'react';

import { useChatApi } from './api/chat-api-context';
import { useChat, useChats, useDataTopics } from './api/hooks';
import type { Chat, ChatMessage, ChatResponse } from './api/types';

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
const useCombinedHistory = (chat: Chat | undefined, refetchChat: () => void) => {
  const [localHistory, setLocalHistory] = useState<ChatMessage[]>([]);

  const appendToLocalHistory = useCallback((message: ChatMessage) => {
    setLocalHistory((history) => [...history, message]);
  }, []);

  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const api = useChatApi();
  const sendMessage = useCallback(
    (message: string) => {
      if (!api || !chat) {
        return;
      }

      const messageObj: ChatMessage = {
        content: message,
        role: 'user',
      };

      appendToLocalHistory(messageObj);
      setIsAwaitingResponse(true);

      void api.ai.chat
        .post(chat.chatId, { text: messageObj.content })
        .then((response) => {
          const msg = mapToChatMessage(response);
          appendToLocalHistory(msg);
        })
        .catch((e) => {
          if (e instanceof Error) {
            console.error('Error when sending message:', e.message);
            appendToLocalHistory({
              content: 'Oh snap, something went wrong. Please try again later.',
              role: 'assistant',
              type: 'Text',
            });
          }
        })
        .finally(() => setIsAwaitingResponse(false));
    },
    [api, chat, appendToLocalHistory],
  );

  const clearHistory = useCallback(() => {
    if (!chat) {
      return;
    }

    api?.ai.chat
      .clearHistory(chat.chatId)
      .then(() => {
        // TODO: avoid refetching and simply set chat history state to empty
        refetchChat();
        setLocalHistory([
          {
            role: 'assistant',
            content: "Let's start over. Try asking questions about your dataset.",
          },
        ]);
      })
      .catch(console.error);
  }, [api, chat, refetchChat]);

  const history = useMemo(() => {
    return (chat?.chatHistory ?? []).concat(localHistory);
  }, [chat?.chatHistory, localHistory]);

  return {
    history,
    clearHistory,
    sendMessage,
    isAwaitingResponse,
    isLoading: !chat,
  };
};

interface UseChatSessionResult {
  history: ChatMessage[];
  clearHistory: () => void;
  sendMessage: (message: string) => void;
  isAwaitingResponse: boolean;
  isLoading: boolean;
}

/**
 * React hook that returns a chat session object for the given data model or
 * perspective.
 *
 * Maintains chat history and updates when a message is sent/received or when
 * history is cleared.
 *
 * If a chat session does not already exist, then one is created.
 *
 * @param contextTitle - the title of the data model or perspective
 * @internal
 */
export const useChatSession = (contextTitle: string): UseChatSessionResult => {
  const { data: dataTopics, isLoading: dataTopicsLoading } = useDataTopics();
  const { data: chats, isLoading: chatsLoading, refetch: refetchChats } = useChats();

  const contextId = dataTopics?.find((d) => d.name === contextTitle)?.id;
  const chatId = chats.find((c) => c.contextId === contextId)?.chatId;

  // Get full chat session object by chatId
  const { data: chat, refetch: refetchChat } = useChat(chatId);

  const api = useChatApi();

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!dataTopicsLoading && !contextId) {
      console.error('No data topic found for context title:', contextTitle);
      return;
    }

    if (contextId && !chatId && !chatsLoading) {
      api.ai.chat
        .create(contextId)
        .then((r) => console.log(r))
        .then(() => refetchChats())
        .catch(console.error);
    }
  }, [contextId, api, chatId, chatsLoading, refetchChats, contextTitle, dataTopicsLoading]);

  return useCombinedHistory(chat, refetchChat);
};
