import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { UNKNOWN_ERROR } from '../api/errors';
import { ChatMessage } from '../api/types';
import { useChatConfig } from '../chat-config';
import MessageResolver from './message-resolver';
import TextMessage from './text-message';

export type MessageListResolverProps = {
  messages: ChatMessage[];
  sendMessage?: (message: string) => void;
};

export default function MessageListResolver({
  messages,
  sendMessage = () => {},
}: MessageListResolverProps) {
  const { enableFollowupQuestions } = useChatConfig();

  const allowFollowupQuestions = (msg: ChatMessage, index: number) =>
    index === messages.length - 1 && 'type' in msg && msg.type === 'nlq';

  const unexpectedErrorHandler = ({ error }: FallbackProps) => {
    console.debug('Unexpected error occurred when resolving a chat message:', error);
    return <TextMessage align="left">{UNKNOWN_ERROR}</TextMessage>;
  };

  return (
    <div className="csdk-flex csdk-flex-col csdk-gap-y-4">
      {messages.map((msg, i) => (
        <ErrorBoundary key={i} fallbackRender={unexpectedErrorHandler}>
          <MessageResolver
            key={i}
            message={msg}
            sendMessage={sendMessage}
            allowFollowupQuestions={enableFollowupQuestions && allowFollowupQuestions(msg, i)}
          />
        </ErrorBoundary>
      ))}
    </div>
  );
}
