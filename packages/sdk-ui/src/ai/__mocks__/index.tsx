import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import { mockToken, mockUrl } from '@/__mocks__/msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import AiContextProvider from '../ai-context-provider';

/**
 * A component that wraps an AI hook/component with all required providers.
 * For use in unit tests only.
 *
 * @internal
 */
export const AiTestWrapper = ({ children }: { children: ReactNode }) => (
  <SisenseContextProvider url={mockUrl} token={mockToken}>
    <AiContextProvider>
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: {
                retry: false,
              },
            },
          })
        }
      >
        {children}
      </QueryClientProvider>
    </AiContextProvider>
  </SisenseContextProvider>
);
