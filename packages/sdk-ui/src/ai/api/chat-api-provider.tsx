import { createContext, ReactNode, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useSisenseContext } from '../../sisense-context/sisense-context';
import { ChatRestApi } from './chat-rest-api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

/**
 * Exported for testing purposes only.
 *
 * @internal
 */
export const ChatApiContext = createContext<ChatRestApi | undefined>(undefined);

export const useChatApi = () => useContext(ChatApiContext);

/**
 * React component
 *
 * @internal
 */
export const ChatApiProvider = ({ children }: { children: ReactNode }) => {
  const { app } = useSisenseContext();
  const api = useMemo(() => (app ? new ChatRestApi(app.httpClient) : undefined), [app]);

  return (
    <ChatApiContext.Provider value={api}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ChatApiContext.Provider>
  );
};
