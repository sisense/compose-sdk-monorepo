import { ReactNode } from 'react';

import { ChatIdStorageProvider } from '@/modules/ai/chat-id-storage-provider';

import { ChatApiProvider } from './api/chat-api-provider';

export interface AiContextProviderProps {
  children: ReactNode;
  /**
   * Boolean flag to indicate whether the chat session should be volatile.
   *
   * When `false` the chat session history will be stored per user per datamodel. The retention period is configurable in Sisense Fusion.
   *
   * When the `Chatbot` component renders, if a previous chat history exists for the current user and datamodel, it will be restored. The user may continue the conversation or clear the history.
   *
   * When `true` a new chat session (with no history) will be created each time the `Chatbot` comoponent initializes.
   *
   * @default false
   */
  volatile?: boolean;
}

/**
 * React component that wraps all generative AI components and hooks.
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
 * @param props - AI Context Provider Props
 * @returns An AI Context Provider Component
 * @group Generative AI
 */
export default function AiContextProvider({ children, volatile }: AiContextProviderProps) {
  return (
    <ChatIdStorageProvider>
      <ChatApiProvider volatile={volatile}>{children}</ChatApiProvider>
    </ChatIdStorageProvider>
  );
}
