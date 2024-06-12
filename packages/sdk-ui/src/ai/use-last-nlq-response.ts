import { useMemo } from 'react';
import { useGetAllChats } from './api/hooks';
import type { NlqResponseData } from './api/types';
import { useChatHistory } from './api/chat-history';
import { isNlqMessage } from './use-chat-session';

/**
 * Parameters for the useLastNlqResponse hook.
 *
 * @internal
 */
interface UseLastNlqResponseParams {
  /** The title of the data model or perspective */
  contextTitle: string;
}

/**
 * React hook that returns the last NLQ response for the chat that corresponds
 * to the given data model or perspective.
 *
 * @param params - Parameters for the hook
 * @internal
 */
export const useLastNlqResponse = ({
  contextTitle,
}: UseLastNlqResponseParams): NlqResponseData | null => {
  const { data: chats } = useGetAllChats();

  const chatId = chats.find((c) => c.contextTitle === contextTitle)?.chatId;

  const { history: chatHistory } = useChatHistory(chatId);

  return useMemo(() => {
    if (chatHistory?.length) {
      const lastNlqMessage = chatHistory[chatHistory.length - 1];
      if (isNlqMessage(lastNlqMessage)) {
        return JSON.parse(lastNlqMessage.content);
      }
    }

    return null;
  }, [chatHistory]);
};
