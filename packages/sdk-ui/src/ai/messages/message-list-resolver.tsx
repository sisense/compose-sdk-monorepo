import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { ChatMessage } from '../api/types';
import { useChatbotContext } from '../chatbot-context';
import MessageResolver from './message-resolver';

export type MessageListResolverProps = {
  messages: ChatMessage[];
  sendMessage?: (message: string) => void;
};

export default function MessageListResolver({
  messages,
  sendMessage = () => {},
}: MessageListResolverProps) {
  const { selectedContext } = useChatbotContext();

  const allowFollowupQuestions = (msg: ChatMessage, index: number) =>
    index === messages.length - 1 && 'type' in msg && msg.type === 'nlq';

  // To avoid application crashing (should be replaced with design team solution)
  const unexpectedErrorHandler = ({ error }: FallbackProps) => {
    console.debug('Unexpected error occurred when resolving a chat message:', error);
    return (
      <div
        className="csdk-p-4 csdk-text-sm csdk-text-red-800 csdk-rounded-lg csdk-bg-red-50 dark:csdk-bg-gray-800 dark:csdk-text-red-400"
        role="alert"
      >
        <span className="font-medium">Error: unable to render response</span>
      </div>
    );
  };

  return (
    <div className="csdk-flex csdk-flex-col csdk-gap-y-4">
      {messages.map((msg, i) => (
        <ErrorBoundary key={i} fallbackRender={unexpectedErrorHandler}>
          <MessageResolver
            key={i}
            message={msg}
            dataSource={selectedContext!.name}
            sendMessage={sendMessage}
            allowFollowupQuestions={allowFollowupQuestions(msg, i)}
          />
        </ErrorBoundary>
      ))}
    </div>
  );
}
