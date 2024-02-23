import { createContext, ReactNode, useContext } from 'react';

export interface ChatConfig {
  /**
   * Boolean flag to show or hide suggested questions following a chat response
   *
   * If not specified, the default value is `false`
   */
  enableFollowupQuestions: boolean;

  /**
   * Number of recommended queries that should be shown in a chat session
   *
   * If not specified, the default value is `4`
   */
  numOfRecommendations: number;

  /**
   * The default context (data model or perspective) title to use for a chat session
   *
   * If specified, the data topic selector screen will not be shown.
   */
  defaultContextTitle?: string;
}

export const DEFAULTS = Object.freeze<ChatConfig>({
  enableFollowupQuestions: false,
  numOfRecommendations: 4,
});

const ChatConfigContext = createContext<ChatConfig>({
  enableFollowupQuestions: DEFAULTS.enableFollowupQuestions,
  numOfRecommendations: DEFAULTS.numOfRecommendations,
});

export type ChatConfigProviderProps = {
  children: ReactNode;
  value: Partial<ChatConfig>;
};

export const useChatConfig = () => useContext(ChatConfigContext);

export const ChatConfigProvider = ({ children, value }: ChatConfigProviderProps) => {
  const config = Object.entries(value).reduce<ChatConfig>(
    (acc, [key, val]) => {
      if (val) {
        acc[key] = val;
      }

      return acc;
    },
    { ...DEFAULTS },
  );

  return <ChatConfigContext.Provider value={config}>{children}</ChatConfigContext.Provider>;
};
