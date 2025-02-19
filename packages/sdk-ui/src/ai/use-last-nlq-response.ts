import { useMemo } from 'react';
import type { NlqResponseData, ChatContextDetails } from './api/types';
import { useChatHistory } from './api/chat-history';
import { isNlqMessage } from './use-chat-session';
import { useGetChat } from '@/ai/use-get-chat';

/**
 * Parameters for the useLastNlqResponse hook.
 *
 * @internal
 */
interface UseLastNlqResponseParams {
  /** The title of the data model or perspective */
  contextTitle: string;

  /** optional chat context details */
  contextDetails?: ChatContextDetails;
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
  contextDetails,
}: UseLastNlqResponseParams): NlqResponseData | null => {
  const { chatId } = useGetChat(contextTitle, contextDetails);

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
