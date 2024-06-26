import { useEffect, useMemo, useState } from 'react';
import {
  useGetAllChats,
  useGetDataTopics,
  useSendChatMessage,
  useMaybeCreateChat,
} from './api/hooks';
import type { ChatMessage, NlqMessage, NlqResponseData } from './api/types';
import { useChatHistory } from './api/chat-history';
import { CHAT_UNAVAILABLE_ERROR, FETCH_HISTORY_ERROR } from './api/errors';

/**
 * Result of the useChatSession hook.
 *
 * @internal
 */
export interface UseChatSessionResult {
  chatId: string | undefined;
  history: ChatMessage[];
  lastNlqResponse: NlqResponseData | null;
  sendMessage: (message: string) => void;
  isAwaitingResponse: boolean;
  isLoading: boolean;
  lastError: Error | null;
}

export const isNlqMessage = (message: ChatMessage | null | undefined): message is NlqMessage =>
  !!message && 'type' in message && message.type === 'nlq';

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
  const { data: dataTopics, isLoading: dataTopicsLoading } = useGetDataTopics();
  const { data: chats, isLoading: chatsLoading } = useGetAllChats();

  const contextId = dataTopics?.find((d) => d.title === contextTitle)?.title;
  const chatId = chats.find((c) => c.contextTitle === contextId)?.chatId;

  const contextExists = dataTopicsLoading || !!contextId;
  const chatExists = chatsLoading || !!chatId;

  const [lastError, setLastError] = useState<Error | null>(null);
  const { isError: isCreateChatError } = useMaybeCreateChat(
    contextId,
    contextExists && !chatExists,
  );

  const { history: chatHistory, isLoading, isError: isFetchHistoryError } = useChatHistory(chatId);

  useEffect(() => {
    if (isCreateChatError) {
      setLastError(new Error(CHAT_UNAVAILABLE_ERROR));
    } else if (isFetchHistoryError) {
      setLastError(new Error(FETCH_HISTORY_ERROR));
    }
  }, [isCreateChatError, isFetchHistoryError]);

  const { mutate: sendMessage, isLoading: isSendMessageLoading } = useSendChatMessage(chatId);

  const lastNlqResponse: NlqResponseData | null = useMemo(() => {
    if (chatHistory?.length) {
      const lastNlqMessage = chatHistory[chatHistory.length - 1];
      if (isNlqMessage(lastNlqMessage)) {
        return JSON.parse(lastNlqMessage.content);
      }
    }

    return null;
  }, [chatHistory]);

  return {
    chatId,
    history: chatHistory ?? [],
    lastNlqResponse,
    sendMessage,
    isAwaitingResponse: isSendMessageLoading,
    isLoading,
    lastError,
  };
};
