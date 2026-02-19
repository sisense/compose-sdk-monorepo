import { memo } from 'react';

import { ChatMessage, NlqResponseData } from '../api/types.js';
import { isNlqMessage, isTextMessage } from '../use-chat-session.js';
import NlqMessageGroup from './nlq-message-group.js';
import TextMessage from './text-message.js';

type MessageResolverProps = {
  message: ChatMessage;
  isLastMessage?: boolean;
};

function MessageResolver({ message, isLastMessage }: MessageResolverProps) {
  if (isNlqMessage(message)) {
    const nlqResponse = JSON.parse(message.content) as NlqResponseData;

    return <NlqMessageGroup data={nlqResponse} alwaysShowFeedback={isLastMessage} />;
  }

  const content = isTextMessage(message) ? JSON.parse(message.content).answer : message.content;

  return <TextMessage align={message.role === 'user' ? 'right' : 'left'}>{content}</TextMessage>;
}

export default memo(MessageResolver);
