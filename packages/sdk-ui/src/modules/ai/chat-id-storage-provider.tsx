import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import { ChatContextDetails } from '@/modules/ai/api/types';

export interface ChatIdMapProviderProps {
  children: ReactNode;
}

export interface ChatIdStorage {
  saveChatId: (chatId: string, contextTitle: string, contextDetails?: ChatContextDetails) => void;
  getChatId: (contextTitle: string, contextDetails?: ChatContextDetails) => string | undefined;
}

export const ChatIdStorageContext = createContext<ChatIdStorage>({} as ChatIdStorage);

export const useChatIdStorage = () => useContext(ChatIdStorageContext);

export const ChatIdStorageProvider = ({ children }: ChatIdMapProviderProps) => {
  const [storage, setStorage] = useState<Record<string, string>>({});

  const getKey = useCallback(
    (contextTitle: string, contextDetails?: ChatContextDetails) =>
      `${contextTitle}_${contextDetails?.dashboardId ?? ''}`,
    [],
  );

  const saveChatId = useCallback(
    (chatId: string, contextTitle: string, contextDetails?: ChatContextDetails) => {
      setStorage((prevStorage) => ({
        ...prevStorage,
        [getKey(contextTitle, contextDetails)]: chatId,
      }));
    },
    [getKey],
  );

  const getChatId = useCallback(
    (contextTitle: string, contextDetails?: ChatContextDetails) =>
      storage[getKey(contextTitle, contextDetails)],
    [storage, getKey],
  );

  return (
    <ChatIdStorageContext.Provider value={{ saveChatId, getChatId }}>
      {children}
    </ChatIdStorageContext.Provider>
  );
};
