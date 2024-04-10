import { createContext, ReactNode, useContext } from 'react';

export interface ChatStyle {
  backgroundColor?: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
  messageBackgroundColor?: string;
  inputBackgroundColor?: string;
  border?: false | string;
  suggestions?: {
    textColor?: string;
    border?: string;
    hoverBackgroundColor?: string;
    loadingGradient?: [string, string];
  };
  iconColor?: string;
}

export type ChatStyleProviderProps = {
  children: ReactNode;
  value: ChatStyle;
};

const ChatStyleContext = createContext<ChatStyle>({});

export const useChatStyle = () => useContext(ChatStyleContext);

export const ChatStyleProvider = ({ children, value }: ChatStyleProviderProps) => {
  return <ChatStyleContext.Provider value={value}>{children}</ChatStyleContext.Provider>;
};
