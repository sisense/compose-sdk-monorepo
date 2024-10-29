import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { ChatMessage } from '../api/types';
import MessageResolver from './message-resolver';
import TextMessage from './text-message';
import { useTranslation } from 'react-i18next';

const unexpectedErrorHandler = ({
  error,
  displayMessage,
}: FallbackProps & { displayMessage: string }) => {
  console.debug('Unexpected error occurred when resolving a chat message:', error);
  return <TextMessage align="left">{displayMessage}</TextMessage>;
};

export type MessageListResolverProps = {
  messages: ChatMessage[];
};

export default function MessageListResolver({ messages }: MessageListResolverProps) {
  const { t } = useTranslation();
  return (
    <>
      {messages.map((msg, i) => (
        <ErrorBoundary
          key={i}
          fallbackRender={(props) =>
            unexpectedErrorHandler({
              ...props,
              displayMessage: t('ai.errors.unexpected'),
            })
          }
        >
          <MessageResolver key={i} message={msg} isLastMessage={i === messages.length - 1} />
        </ErrorBoundary>
      ))}
    </>
  );
}
