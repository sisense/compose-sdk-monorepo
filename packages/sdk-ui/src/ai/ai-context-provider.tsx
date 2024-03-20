import { ReactNode, useEffect } from 'react';

import { ChatConfig, ChatConfigProvider } from './chat-config';
import { ChatApiProvider } from './api/chat-api-provider';

const WARNING_MESSAGE =
  '\n' +
  '=================================================================\n' +
  'WARNING: You are importing a component from @sisense/sdk-ui/ai.\n' +
  'This component is currently in PRIVATE PREVIEW and is exclusively\n' +
  'available to a select group of pre-approved customers.\n\n' +
  'As a preview feature, this component may have limited support\n' +
  'and is subject to potential changes.\n' +
  '=================================================================';

export type AiContextProviderProps = {
  children: ReactNode;

  /** @internal */
  config?: Partial<ChatConfig>;
};

/**
 * React component that wraps all generative AI components and hooks.
 *
 * ::: warning Note
 * This component is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
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
export default function AiContextProvider({ children, config }: AiContextProviderProps) {
  useEffect(() => {
    console.warn(WARNING_MESSAGE);
  }, []);

  return (
    <ChatConfigProvider value={config ?? {}}>
      <ChatApiProvider>{children}</ChatApiProvider>
    </ChatConfigProvider>
  );
}
