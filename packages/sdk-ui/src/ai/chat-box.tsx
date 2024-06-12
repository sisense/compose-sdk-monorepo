import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';

import LoadingSpinner from '../common/components/loading-spinner';
import { useClearChatHistory } from './api/chat-history';
import { CHAT_UNAVAILABLE_ERROR } from './api/errors';
import { useChatConfig } from './chat-config';
import ChatInput from './chat-input';
import ChatWelcomeMessage from './messages/chat-welcome-message';
import ErrorContainer from './common/error-container';
import LoadingDotsIcon from './icons/loading-dots-icon';
import ClearHistoryMessage from './messages/clear-history-message';
import MessageListResolver from './messages/message-list-resolver';
import TextMessage from './messages/text-message';
import NavBackButton from './nav-back-button';
import { SuggestionsWithIntro } from './suggestions';
import Toolbar from './common/toolbar';
import { useChatSession } from './use-chat-session';
import { useGetQueryRecommendationsInternal } from './use-get-query-recommendations';
import { useThemeContext } from '..';
import { Themable } from '@/theme-provider/types';
import AiDisclaimer from './ai-disclaimer';
import ClickableMessage from './messages/clickable-message';
import { BetaLabel } from './common/beta-label';

export type ChatBoxProps = {
  contextTitle: string;
  onGoBack?: () => void;
};

const ChatBody = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.aiChat.body.gapBetweenMessages};
  overflow-y: scroll;
  padding-left: ${({ theme }) => theme.aiChat.body.paddingLeft};
  padding-right: ${({ theme }) => theme.aiChat.body.paddingRight};
  padding-top: ${({ theme }) => theme.aiChat.body.paddingTop};
  padding-bottom: ${({ theme }) => theme.aiChat.body.paddingBottom};
  flex: initial;
  height: 100%;
`;

const ChatFooter = styled.div<Themable>`
  padding-left: ${({ theme }) => theme.aiChat.footer.paddingLeft};
  padding-right: ${({ theme }) => theme.aiChat.footer.paddingRight};
  padding-top: ${({ theme }) => theme.aiChat.footer.paddingTop};
  padding-bottom: ${({ theme }) => theme.aiChat.footer.paddingBottom};
  display: flex;
  flex-direction: column;
  row-gap: 6px;
`;

const FollowupQuestionsContainer = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.aiChat.suggestions.gap};
`;

export default function ChatBox({ contextTitle, onGoBack }: ChatBoxProps) {
  const {
    data: queryRecommendations,
    isLoading: recommendationsLoading,
    isError: recommendationsError,
  } = useGetQueryRecommendationsInternal({
    contextTitle,
  });
  const questions = useMemo(
    () => queryRecommendations.map((q) => q.nlqPrompt),
    [queryRecommendations],
  );

  const {
    history,
    lastNlqResponse,
    isAwaitingResponse,
    sendMessage,
    isLoading,
    chatId,
    lastError,
  } = useChatSession(contextTitle);

  const { mutate: clearHistory, isLoading: isClearingHistory } = useClearChatHistory(chatId);

  const [isClearHistoryOptionsVisible, setIsClearHistoryOptionsVisible] = useState(false);
  const showClearHistoryOptions = () => setIsClearHistoryOptionsVisible(true);
  const hideClearHistoryOptions = () => setIsClearHistoryOptionsVisible(false);
  const onClearHistoryConfirm = () => {
    clearHistory();
    hideClearHistoryOptions();
  };

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, isClearHistoryOptionsVisible, isAwaitingResponse]);

  const ref = useRef<HTMLDivElement>(null);

  const { enableFollowupQuestions, enableHeader, numOfRecentPrompts } = useChatConfig();
  const { themeSettings } = useThemeContext();

  const header = enableHeader ? (
    <Toolbar
      ref={ref}
      title={contextTitle}
      leftNav={
        onGoBack && (
          <NavBackButton onClick={onGoBack} color={themeSettings.aiChat.header.textColor} />
        )
      }
      rightNav={<BetaLabel />}
      style={themeSettings.aiChat.header}
    />
  ) : null;

  const uniqueRecentPrompts = useMemo(
    () =>
      [
        ...new Set(
          history
            .filter((m) => m.role === 'user')
            .filter((m) => !questions.includes(m.content))
            .map((m) => m.content)
            .reverse(),
        ),
      ].slice(0, numOfRecentPrompts),
    [history, numOfRecentPrompts, questions],
  );

  if (lastError?.message === CHAT_UNAVAILABLE_ERROR) {
    return (
      <>
        {enableHeader && header}
        <ErrorContainer text={lastError.message} />
      </>
    );
  }

  return (
    <>
      {header}
      <ChatBody ref={chatContainerRef} theme={themeSettings}>
        <ChatWelcomeMessage />
        <SuggestionsWithIntro
          questions={questions}
          isLoading={recommendationsLoading}
          onSelection={sendMessage}
        />
        {lastError && <TextMessage align="left">{lastError.message}</TextMessage>}
        {isLoading ? <LoadingSpinner /> : <MessageListResolver messages={history} />}
        {enableFollowupQuestions && lastNlqResponse && (
          <FollowupQuestionsContainer theme={themeSettings}>
            {lastNlqResponse.followupQuestions.slice(0, 2).map((question, i) => (
              <ClickableMessage
                key={i}
                align="left"
                onClick={() => {
                  sendMessage(question);
                }}
              >
                <div className="csdk-py-[7px] csdk-px-4">{question}</div>
              </ClickableMessage>
            ))}
          </FollowupQuestionsContainer>
        )}
        {(isAwaitingResponse || isClearingHistory) && <LoadingDotsIcon />}
        {isClearHistoryOptionsVisible && (
          <ClearHistoryMessage
            onCancel={hideClearHistoryOptions}
            onConfirm={onClearHistoryConfirm}
          />
        )}
      </ChatBody>

      <ChatFooter theme={themeSettings}>
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isAwaitingResponse || isLoading}
          onClearHistoryClick={showClearHistoryOptions}
          suggestions={questions}
          recentPrompts={uniqueRecentPrompts}
          isLoading={recommendationsLoading || isLoading}
          recommendationsError={recommendationsError}
          onChange={hideClearHistoryOptions}
        />
        <AiDisclaimer theme={themeSettings} />
      </ChatFooter>
    </>
  );
}
