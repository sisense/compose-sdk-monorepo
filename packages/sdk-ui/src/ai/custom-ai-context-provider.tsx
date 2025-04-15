import { PropsWithChildren } from 'react';
import { ChatApiContext } from './api/chat-api-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatIdStorageProvider } from './chat-id-storage-provider';
import { type ChatRestApi } from './api/chat-rest-api';
import { CustomContextProviderProps } from '../types';

/** @internal */
export type CustomAiContext = {
  api?: ChatRestApi;
};

/** @internal */
export type CustomAiContextProviderProps = CustomContextProviderProps<CustomAiContext>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

/** @internal */
export function CustomAiContextProvider({
  children,
  context,
}: PropsWithChildren<CustomAiContextProviderProps>) {
  return (
    <ChatIdStorageProvider>
      <ChatApiContext.Provider value={context?.api}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ChatApiContext.Provider>
    </ChatIdStorageProvider>
  );
}
