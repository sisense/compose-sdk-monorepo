import { createContext, ReactNode, useContext } from 'react';

import { ChatMode } from '@/ai/api/types';

export interface ChatConfig {
  /**
   * Boolean flag to show or hide suggested questions following a chat response. Currently
   * follow-up questions are still under development and are not validated. Therefore, follow-up
   * questions are disabled by default.
   */
  enableFollowupQuestions: boolean;

  /**
   * Number of recommended queries that should be shown in a chat session
   *
   * If not specified, the default value is `4`
   */
  numOfRecommendations: number;

  /**
   * Number of recent prompts that should be shown in a chat session
   *
   * If not specified, the default value is `5`
   */
  numOfRecentPrompts: number;

  /**
   * The default context (data model or perspective) title to use for a chat session
   *
   * If specified, the data topic selector screen will not be shown.
   */
  defaultContextTitle?: string;

  /**
   * The chat mode to use for a chat session.
   *
   * @internal
   */
  chatMode?: ChatMode;

  /** The input prompt text to show in the chat input box */
  inputPromptText: string;

  /**
   * The welcome text to show at the top of a chat session.
   *
   * A value of `false` will hide the welcome text.
   *
   * If not specified, a default message will be displayed.
   */
  welcomeText?: string | false;

  /**
   * The message text to show above the initial suggested questions in a chat session.
   *
   * A value of `false` will hide the text.
   *
   * If not specified, a default message will be displayed.
   */
  suggestionsWelcomeText?: string | false;

  /**
   * Boolean flag to show or hide the header in a chat session.
   *
   * @default true
   * @internal
   */
  enableHeader?: boolean;

  /**
   * Boolean flag to show or hide the insights button in a chat session.
   *
   * @default true
   * @internal
   */
  enableInsights?: boolean;
}

export const DEFAULTS = Object.freeze<ChatConfig>({
  enableFollowupQuestions: false,
  enableHeader: true,
  enableInsights: true,
  numOfRecommendations: 4,
  numOfRecentPrompts: 5,
  inputPromptText: 'Ask a question or type "/" for ideas',
  welcomeText:
    'Welcome to the Analytics Assistant! I can help you explore and gain insights from your data.',
  suggestionsWelcomeText: 'Some questions you may have:',
});

const ChatConfigContext = createContext<ChatConfig>({
  ...DEFAULTS,
});

export type ChatConfigProviderProps = {
  children: ReactNode;
  value: Partial<ChatConfig>;
};

export const useChatConfig = () => useContext(ChatConfigContext);

export const ChatConfigProvider = ({ children, value }: ChatConfigProviderProps) => {
  const config = Object.entries(value).reduce<ChatConfig>(
    (acc, [key, val]) => {
      if (val !== undefined) {
        acc[key] = val;
      }

      return acc;
    },
    { ...DEFAULTS },
  );

  return <ChatConfigContext.Provider value={config}>{children}</ChatConfigContext.Provider>;
};
