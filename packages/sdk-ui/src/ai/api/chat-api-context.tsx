import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
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

const ChatApiContext = createContext<ChatRestApi | undefined>(undefined);

export const useChatApi = () => useContext(ChatApiContext);

const WARNING_MESSAGE =
  '\n' +
  '=================================================================\n' +
  'WARNING: You are importing a component from @sisense/sdk-ui/ai.\n' +
  'This component is currently in PRIVATE PREVIEW and is exclusively\n' +
  'available to a select group of pre-approved customers.\n\n' +
  'As a preview feature, this component may have limited support\n' +
  'and is subject to potential changes.\n' +
  '=================================================================';

/**
 * React component that allows wrapped components to access the AI Chat API on a
 * Sisense instance. Depends on {@link SisenseContextProvider}.
 *
 * @internal
 */
export const ChatApiContextProvider = ({ children }: { children: ReactNode }) => {
  const { app } = useSisenseContext();
  const api = useMemo(() => (app ? new ChatRestApi(app.httpClient) : undefined), [app]);

  useEffect(() => {
    console.warn(WARNING_MESSAGE);
  }, []);

  return (
    <ChatApiContext.Provider value={api}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ChatApiContext.Provider>
  );
};
