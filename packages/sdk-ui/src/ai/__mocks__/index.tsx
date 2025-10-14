import { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockToken, mockUrl } from '@/__mocks__/msw';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';

import AiContextProvider from '../ai-context-provider';

/**
 * A component that wraps an AI hook/component with all required providers.
 * For use in unit tests only.
 *
 * @internal
 */
export const AiTestWrapper = ({
  children,
  volatile,
}: {
  children: ReactNode;
  volatile?: boolean;
}) => (
  <SisenseContextProvider
    url={mockUrl}
    token={mockToken}
    showRuntimeErrors={true}
    appConfig={{ errorBoundaryConfig: { alwaysShowErrorText: true } }}
  >
    <AiContextProvider volatile={volatile}>
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
