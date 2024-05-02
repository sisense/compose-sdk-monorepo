import { memo } from 'react';

import { ChatMessage, NlqResponseData } from '../api/types';
import { isNlqMessage } from '../use-chat-session';
import NlqMessageGroup from './nlq-message-group';
import TextMessage from './text-message';

type MessageResolverProps = {
  message: ChatMessage;
  isLastMessage?: boolean;
};

function MessageResolver({ message, isLastMessage }: MessageResolverProps) {
  if (isNlqMessage(message)) {
    const nlqResponse = JSON.parse(message.content) as NlqResponseData;

    return <NlqMessageGroup data={nlqResponse} alwaysShowFeedback={isLastMessage} />;
  }

  return (
    <TextMessage align={message.role === 'user' ? 'right' : 'left'}>{message.content}</TextMessage>
  );
}

export default memo(MessageResolver);
