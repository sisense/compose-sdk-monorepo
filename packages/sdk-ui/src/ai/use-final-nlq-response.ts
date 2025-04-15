import type { NlqResponseData, ChatContextDetails } from './api/types';
import { useChatHistory } from './api/chat-history';
import { useGetChat } from '@/ai/use-get-chat';
import { useMemo } from 'react';
import { isNlqMessage } from '@/ai/use-chat-session';

/**
 * Parameters for the useFinalNlqResponse hook.
 *
 * @internal
 */
export interface UseFinalNlqResponseParams {
  /** The title of the data model or perspective */
  contextTitle: string;

  /** optional chat context details */
  contextDetails?: ChatContextDetails;
}

/**
 * React hook that returns the final NLQ response for the chat that corresponds
 * to the given data model or perspective.
 *
 * @param params - Parameters for the hook
 * @internal
 */
export const useFinalNlqResponse = ({
  contextTitle,
  contextDetails,
}: UseFinalNlqResponseParams): NlqResponseData | null => {
  const { chatId } = useGetChat(contextTitle, contextDetails);

  const { history: chatHistory } = useChatHistory(chatId);

  return useMemo(() => {
    if (chatHistory?.length) {
      const lastNlqMessage = chatHistory.slice().reverse().find(isNlqMessage);
      if (lastNlqMessage) {
        return JSON.parse(lastNlqMessage.content) as NlqResponseData;
      }
    }

    return null;
  }, [chatHistory]);
};
