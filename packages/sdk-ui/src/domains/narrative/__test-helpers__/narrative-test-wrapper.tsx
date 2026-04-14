import { type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockToken, mockUrl } from '@/__mocks__/msw';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';

/**
 * Wraps narrative hooks with Sisense app context and a TanStack Query client (retry disabled).
 * Does not mount `modules/ai` providers.
 *
 * @internal
 */
export const NarrativeTestWrapper = ({ children }: { children: ReactNode }) => (
  <SisenseContextProvider
    url={mockUrl}
    token={mockToken}
    showRuntimeErrors={true}
    appConfig={{ errorBoundaryConfig: { alwaysShowErrorText: true } }}
  >
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
  </SisenseContextProvider>
);
