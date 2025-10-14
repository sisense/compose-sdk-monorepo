import { CSSProperties } from 'react';

import { useThemeContext } from '@/theme-provider';

import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { ChatConfig, ChatConfigProvider } from './chat-config';
import { ChatFrame } from './chat-frame';
import ChatRouter from './chat-router';

/**
 * Props for {@link Chatbot} component.
 */
export interface ChatbotProps {
  /**
   * Total width of the chatbot
   *
   * If not specified, a default width of `500px` will be used.
   */
  width?: CSSProperties['width'];

  /**
   * Total height of the chatbot
   *
   * If not specified, a default height of `900px` will be used.
   */
  height?: CSSProperties['height'];

  /**
   * Various configuration options for the chatbot
   */
  config?: Partial<ChatConfig>;
}

/**
 * React component that displays a chatbot with data topic selection.
 * You can optionally configure size, config e.g. data topics, recommendations, UI text.
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
 *         <Chatbot
 *            width={1000}
 *            height={800}
 *            config={{
 *               enableFollowupQuestions: true,
 *               numOfRecommendations: 2,
 *               dataTopicsList: [
 *                  'Sample ECommerce',
 *                   'Sample Healthcare'
 *               ],
 *               inputPromptText: 'What do you want to explore?',
 *               welcomeText: 'Welcome to Acme AI, powered by Sisense',
 *               suggestionsWelcomeText: 'Would you like to know:',
 *            }}
 *         />
 *       </AiContextProvider>
 *     </SisenseContextProvider>
 *   );
 * }
 * ```
 * @param props - {@link ChatbotProps}
 * @group Generative AI
 */
export const Chatbot = asSisenseComponent({
  componentName: 'Chatbot',
})((props: ChatbotProps) => {
  const { width, height, config } = props;
  const { themeSettings } = useThemeContext();
  return (
    <ChatConfigProvider value={config ?? {}}>
      <ChatFrame
        id="csdk-chatbot-frame"
        width={width}
        height={height}
        theme={themeSettings}
        tabIndex={0}
      >
        <ChatRouter />
      </ChatFrame>
    </ChatConfigProvider>
  );
});
