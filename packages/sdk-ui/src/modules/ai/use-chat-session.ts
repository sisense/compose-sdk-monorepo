import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslatableError } from '@/infra/translation/translatable-error';
import { useGetChat } from '@/modules/ai/use-get-chat';
import { useLastNlqResponseFromHistory } from '@/modules/ai/use-last-nlq-response-from-history';

import { useChatHistory } from './api/chat-history';
import { useSendChatMessage } from './api/hooks';
import {
  ChatContextDetails,
  ChatMessage,
  NlqMessage,
  NlqResponseData,
  TextMessage,
} from './api/types';
import { useChatConfig } from './chat-config';

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

export const isTextMessage = (message: ChatMessage | null | undefined): message is TextMessage =>
  !!message && 'type' in message && message.type === 'text';

/**
 * React hook that returns a chat session object for the given data model or
 * perspective.
 *
 * Maintains chat history and updates when a message is sent/received or when
 * history is cleared.
 *
 * If a chat session does not already exist, then one is created.
 *
 * @param {string} contextTitle - the title of the data model or perspective
 * @param {ChatContextDetails} [contextDetails] - optional chat context details
 * @internal
 */
export const useChatSession = (
  contextTitle: string,
  contextDetails?: ChatContextDetails,
): UseChatSessionResult => {
  const { t } = useTranslation();
  const { enableFollowupQuestions } = useChatConfig();

  const { chatId, isError: isCreateChatError } = useGetChat(contextTitle, contextDetails, true);

  const [lastError, setLastError] = useState<Error | null>(null);

  const { history: chatHistory, isLoading, isError: isFetchHistoryError } = useChatHistory(chatId);

  useEffect(() => {
    if (isCreateChatError) {
      setLastError(new TranslatableError('ai.errors.chatUnavailable'));
    } else if (isFetchHistoryError) {
      setLastError(new TranslatableError('ai.errors.fetchHistory'));
    }
  }, [isCreateChatError, isFetchHistoryError, t]);

  const { mutate: sendMessage, isLoading: isSendMessageLoading } = useSendChatMessage(
    chatId,
    enableFollowupQuestions,
  );

  const lastNlqResponse = useLastNlqResponseFromHistory(chatHistory);

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
