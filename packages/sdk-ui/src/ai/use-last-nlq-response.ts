import type { NlqResponseData, ChatContextDetails } from './api/types';
import { useChatHistory } from './api/chat-history';
import { useGetChat } from '@/ai/use-get-chat';
import { useLastNlqResponseFromHistory } from '@/ai/use-last-nlq-response-from-history';

/**
 * Parameters for the useLastNlqResponse hook.
 *
 * @internal
 */
export interface UseLastNlqResponseParams {
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

  return useLastNlqResponseFromHistory(chatHistory);
};
