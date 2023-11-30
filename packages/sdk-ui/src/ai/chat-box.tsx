/* eslint-disable max-lines-per-function */
import { useLayoutEffect, useRef, useState } from 'react';

import { useChatbotContext } from './chatbot-context';
import { useGetQueryRecommendations } from './api/hooks';
import { ChatContext } from './api/types';
import ChatInput from './chat-input';
import LoadingDotsIcon from './icons/loading-dots-icon';
import MagicWandDropdown from './magic-wand-dropdown';
import ClearHistoryMessage from './messages/clear-history-message';
import MessageListResolver from './messages/message-list-resolver';
import NavBackButton from './nav-back-button';
import { SuggestionListWithIntro } from './suggestions';
import Toolbar from './toolbar';
import { useChatSession } from './use-chat-session';
import LoadingIcon from '../common/icons/loading-icon';

export type ChatBoxProps = {
  selectedContext: ChatContext;
};

export default function ChatBox({ selectedContext }: ChatBoxProps) {
  const { setSelectedContext } = useChatbotContext();

  const { data: questions, isLoading: recommendationsLoading } = useGetQueryRecommendations({
    contextId: selectedContext.id,
  });

  const { history, isAwaitingResponse, clearHistory, sendMessage, isLoading } = useChatSession(
    selectedContext.name,
  );

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
      title={selectedContext.name}
      leftNav={<NavBackButton onClick={() => setSelectedContext(undefined)} />}
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
      <div className="csdk-h-full csdk-bg-background-priority csdk-rounded-b-[30px] csdk-flex csdk-flex-col csdk-justify-between csdk-overflow-hidden">
        <div
          ref={chatContainerRef}
          className="csdk-flex csdk-flex-col csdk-gap-y-4 csdk-overflow-y-scroll csdk-p-[16px] csdk-flex-initial csdk-h-full"
        >
          <SuggestionListWithIntro
            questions={questions}
            title={selectedContext.name}
            onSelection={sendMessage}
          />
          {isLoading && (
            <div className="csdk-m-auto">
              <LoadingIcon spin />
            </div>
          )}
          {!isLoading && <MessageListResolver sendMessage={sendMessage} messages={history} />}
          {isAwaitingResponse && <LoadingDotsIcon />}
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
      </div>
    </>
  );
}
