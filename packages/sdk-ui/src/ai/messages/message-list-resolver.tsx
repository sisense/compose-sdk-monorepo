import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { UNEXPECTED_ERROR } from '../api/errors';
import { ChatMessage } from '../api/types';
import MessageResolver from './message-resolver';
import TextMessage from './text-message';

export type MessageListResolverProps = {
  messages: ChatMessage[];
};

export default function MessageListResolver({ messages }: MessageListResolverProps) {
  const unexpectedErrorHandler = ({ error }: FallbackProps) => {
    console.debug('Unexpected error occurred when resolving a chat message:', error);
    return <TextMessage align="left">{UNEXPECTED_ERROR}</TextMessage>;
  };

  return (
    <div className="csdk-flex csdk-flex-col csdk-gap-y-4">
      {messages.map((msg, i) => (
        <ErrorBoundary key={i} fallbackRender={unexpectedErrorHandler}>
          <MessageResolver key={i} message={msg} />
        </ErrorBoundary>
      ))}
    </div>
  );
}
