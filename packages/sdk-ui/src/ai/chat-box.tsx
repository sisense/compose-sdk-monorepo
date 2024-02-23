/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useClearChatHistory } from './api/hooks';
import ChatInput from './chat-input';
import LoadingDotsIcon from './icons/loading-dots-icon';
import LoadingPage from './loading-page';
import MagicWandDropdown from './magic-wand-dropdown';
import ClearHistoryMessage from './messages/clear-history-message';
import ClearHistorySuccessMessage from './messages/clear-history-success-message';
import MessageListResolver from './messages/message-list-resolver';
import NavBackButton from './nav-back-button';
import { SuggestionListWithIntro } from './suggestions';
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

  const { history, isAwaitingResponse, sendMessage, isLoading, chatId } =
    useChatSession(contextTitle);

  const {
    mutate: clearHistory,
    isLoading: isClearingHistory,
    isSuccess,
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

  return (
    <>
      {header}
      <div className="csdk-h-full csdk-bg-background-priority csdk-rounded-b-[30px] csdk-flex csdk-flex-col csdk-justify-between csdk-overflow-hidden csdk-pb-[16px]">
        <div
          ref={chatContainerRef}
          className="csdk-flex csdk-flex-col csdk-gap-y-4 csdk-overflow-y-scroll csdk-p-[16px] csdk-flex-initial csdk-h-full csdk-mb-[16px]"
        >
          <SuggestionListWithIntro
            questions={questions}
            title={contextTitle}
            onSelection={sendMessage}
          />
          {isSuccess && <ClearHistorySuccessMessage />}
          {isLoading && <LoadingPage />}
          {!isLoading && <MessageListResolver sendMessage={sendMessage} messages={history} />}
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
          disabled={isAwaitingResponse}
          onClearHistoryClick={showClearHistoryOptions}
        />
        <div className="csdk-w-[392px] csdk-py-2 csdk-m-auto csdk-text-center csdk-text-ai-xs csdk-text-text-secondary csdk-whitespace-pre-wrap">
          Content is powered by AI, so surprises and mistakes are possible.
          <br />
          Please rate responses so we can improve!
        </div>
      </div>
    </>
  );
}
