import { useMemo } from 'react';

import type { ChatMessage, NlqResponseData } from './api/types.js';
import { isNlqMessage } from './use-chat-session.js';

/**
 * React hook that returns the last NLQ response from chat history
 *
 * @chatHistory [ChatMessage[]] - Parameters for the hook
 * @internal
 */
export const useLastNlqResponseFromHistory = (chatHistory?: ChatMessage[]) => {
  return useMemo(() => {
    if (chatHistory?.length) {
      const lastNlqMessage = chatHistory[chatHistory.length - 1];
      if (isNlqMessage(lastNlqMessage)) {
        return JSON.parse(lastNlqMessage.content) as NlqResponseData;
      }
    }

    return null;
  }, [chatHistory]);
};
