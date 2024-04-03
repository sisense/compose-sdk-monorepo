import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, type FunctionComponent } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

export const SisenseQueryClientProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
