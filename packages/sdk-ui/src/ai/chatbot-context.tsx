import { createContext, ReactNode, useContext, useState } from 'react';

import { ChatContext } from './api/types';

const ChatbotContext = createContext<{
  selectedContext?: ChatContext;
  setSelectedContext: (context: ChatContext | undefined) => void;
}>({
  setSelectedContext: () => {},
});

type ChatbotContextProviderProps = {
  children: ReactNode;
};

export const useChatbotContext = () => useContext(ChatbotContext);

export function ChatbotContextProvider({ children }: ChatbotContextProviderProps) {
  const [selectedContext, setSelectedContext] = useState<ChatContext>();

  return (
    <ChatbotContext.Provider
      value={{
        selectedContext,
        setSelectedContext,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}
