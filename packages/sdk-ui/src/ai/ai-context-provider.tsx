import { ReactNode } from 'react';

import { ChatApiProvider } from './api/chat-api-provider';
import { ChatIdStorageProvider } from '@/ai/chat-id-storage-provider';

export type AiContextProviderProps = {
  children: ReactNode;
  volatile?: boolean;
};

/**
 * React component that wraps all generative AI components and hooks.
 *
 * ::: warning Note
 * This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
 * :::
 *
 * @example
 * ```tsx
 * import { SisenseContextProvider } from '@sisense/sdk-ui';
 * import { AiContextProvider, Chatbot } from '@sisense/sdk-ui/ai';
 *
 * function App() {
 *   return (
 *     <SisenseContextProvider {...sisenseContextProps}>
 *       <AiContextProvider>
 *         <Chatbot />
 *       </AiContextProvider>
 *     </SisenseContextProvider>
 *   );
 * }
 * ```
 * @group Generative AI
 * @beta
 */
export default function AiContextProvider({ children, volatile }: AiContextProviderProps) {
  return (
    <ChatIdStorageProvider>
      <ChatApiProvider volatile={volatile}>{children}</ChatApiProvider>
    </ChatIdStorageProvider>
  );
}
