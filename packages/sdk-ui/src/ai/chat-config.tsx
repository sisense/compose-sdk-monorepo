import { createContext, ReactNode, useContext } from 'react';

import { ChatMode, ChatContextDetails } from '@/ai/api/types';
import { useTranslation } from 'react-i18next';

export interface ChatConfig {
  /**
   * Boolean flag to show or hide suggested questions following a chat response. Currently
   * follow-up questions are still under development and are not validated. Therefore, follow-up
   * questions are disabled by default.
   */
  enableFollowupQuestions: boolean;

  /**
   * Number of recommended queries that should initially be shown in a chat session
   *
   * If not specified, the default value is `4`.
   *
   * Set to `0` to disable initial recommendations.
   */
  numOfRecommendations: number;

  /**
   * Number of recent prompts that should be shown in a chat session
   *
   * If not specified, the default value is `5`
   */
  numOfRecentPrompts: number;

  /**
   * List of titles representing allowed contexts (data models or perspectives) for a chat session.
   *
   * Each context will be validated and checked for availability.
   * If only one context is specified, the data topic selector screen will not be shown.
   */
  dataTopicsList?: string[];

  /**
   * The chat mode to use for a chat session.
   *
   * @internal
   */
  chatMode?: ChatMode;

  /** The input prompt text to show in the chat input box */
  inputPromptText?: string;

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

  /**
   * Boolean flag to start a clean chat on every load.
   *
   * Note: When the flag is `true`, chat history will be preserved and stored for the session but will not be fetched or displayed. Changing this setting back to `false` will make the entire history visible again, even if it was previously hidden. Use the "Clear History" button to completely erase the history.
   *
   * @default false
   */
  hideHistory?: boolean;

  /**
   * Optional chat context details.
   *
   * @internal
   */
  contextDetails?: ChatContextDetails;
}

export const DEFAULTS = Object.freeze<ChatConfig>({
  enableFollowupQuestions: false,
  enableHeader: true,
  enableInsights: true,
  numOfRecommendations: 4,
  numOfRecentPrompts: 5,
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
  const { t } = useTranslation();
  const config = Object.entries(value).reduce<ChatConfig>(
    (acc, [key, val]) => {
      if (val !== undefined) {
        acc[key] = val;
      }

      return acc;
    },
    {
      ...DEFAULTS,
      inputPromptText: t('ai.config.inputPromptText'),
      welcomeText: t('ai.config.welcomeText'),
      suggestionsWelcomeText: t('ai.config.suggestionsWelcomeText'),
    },
  );

  return <ChatConfigContext.Provider value={config}>{children}</ChatConfigContext.Provider>;
};
