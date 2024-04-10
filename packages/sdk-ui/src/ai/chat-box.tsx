/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import LoadingSpinner from '../common/components/loading-spinner';
import { useClearChatHistory } from './api/chat-history';
import { CHAT_UNAVAILABLE_ERROR } from './api/errors';
import { useChatConfig } from './chat-config';
import ChatInput from './chat-input';
import ChatWelcomeMessage from './messages/chat-welcome-message';
import { useChatStyle } from './chat-style-provider';
import ErrorContainer from './common/error-container';
import LoadingDotsIcon from './icons/loading-dots-icon';
import MagicWandDropdown from './magic-wand-dropdown';
import ClearHistoryMessage from './messages/clear-history-message';
import ClearHistorySuccessMessage from './messages/clear-history-success-message';
import MessageListResolver from './messages/message-list-resolver';
import TextMessage from './messages/text-message';
import NavBackButton from './nav-back-button';
import { SuggestionsWithIntro } from './suggestions';
import Toolbar from './toolbar';
import { useChatSession } from './use-chat-session';
import { useGetQueryRecommendationsInternal } from './use-get-query-recommendations';

export type ChatBoxProps = {
  contextTitle: string;
  onGoBack?: () => void;
};

export default function ChatBox({ contextTitle, onGoBack }: ChatBoxProps) {
  const { data: queryRecommendations, isLoading: recommendationsLoading } =
    useGetQueryRecommendationsInternal({
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

  const {
    mutate: clearHistory,
    isLoading: isClearingHistory,
    isSuccess: isHistoryCleared,
  } = useClearChatHistory(chatId);

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

  const header = (
    <Toolbar
      ref={ref}
      title={contextTitle}
      leftNav={onGoBack && <NavBackButton onClick={onGoBack} />}
      rightNav={
        <MagicWandDropdown
          questions={questions}
          isLoading={recommendationsLoading}
          onSelection={sendMessage}
          anchorEl={ref.current}
        />
      }
    />
  );

  const { enableFollowupQuestions } = useChatConfig();
  const { backgroundColor, secondaryTextColor } = useChatStyle();

  if (lastError?.message === CHAT_UNAVAILABLE_ERROR) {
    return (
      <>
        {header}
        <ErrorContainer text={lastError.message} />
      </>
    );
  }

  return (
    <>
      {header}
      <div
        className="csdk-h-full csdk-bg-background-priority csdk-rounded-b-[30px] csdk-flex csdk-flex-col csdk-justify-between csdk-overflow-hidden csdk-pb-[16px]"
        style={{
          backgroundColor,
        }}
      >
        <div
          ref={chatContainerRef}
          className="csdk-flex csdk-flex-col csdk-gap-y-4 csdk-overflow-y-scroll csdk-p-[16px] csdk-flex-initial csdk-h-full"
        >
          <ChatWelcomeMessage />
          <SuggestionsWithIntro
            questions={questions}
            isLoading={recommendationsLoading}
            onSelection={sendMessage}
          />
          {lastError && <TextMessage align="left">{lastError.message}</TextMessage>}
          {isHistoryCleared && <ClearHistorySuccessMessage />}
          {isLoading && <LoadingSpinner />}
          {!isLoading && <MessageListResolver messages={history} />}
          {enableFollowupQuestions && lastNlqResponse && (
            <div className="csdk-flex csdk-flex-col csdk-gap-y-2">
              {lastNlqResponse.followupQuestions.slice(0, 2).map((question, i) => (
                <TextMessage
                  key={i}
                  align="right"
                  onClick={() => {
                    sendMessage(question);
                  }}
                >
                  {question}
                </TextMessage>
              ))}
            </div>
          )}
          {(isAwaitingResponse || isClearingHistory) && <LoadingDotsIcon />}
          {isClearHistoryOptionsVisible && (
            <ClearHistoryMessage
              onCancel={hideClearHistoryOptions}
              onConfirm={onClearHistoryConfirm}
            />
          )}
        </div>

        <ChatInput
          onSendMessage={sendMessage}
          disabled={isAwaitingResponse || isLoading}
          onClearHistoryClick={showClearHistoryOptions}
        />
        <div
          className="csdk-w-[392px] csdk-py-2 csdk-m-auto csdk-text-center csdk-text-ai-xs csdk-text-text-secondary csdk-whitespace-pre-wrap"
          style={{
            color: secondaryTextColor,
          }}
        >
          Content is powered by AI, so surprises and mistakes are possible.
          <br />
          Please rate responses so we can improve!
        </div>
      </div>
    </>
  );
}
