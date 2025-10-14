import { render } from '@testing-library/react';
import { describe, expect, it, Mock } from 'vitest';

import { ChatMessage } from '../api/types';
import {
  isNlqMessage as isNlqMessageOriginal,
  isTextMessage as isTextMessageOriginal,
} from '../use-chat-session';
import MessageResolver from './message-resolver';

vi.mock('./nlq-message-group', () => ({
  default: vi.fn(({ data: { mockedText, userMsg } }) => <div>{userMsg || mockedText}</div>),
}));

vi.mock('./text-message', () => ({
  default: vi.fn(({ align, children }) => <div data-testid={align}>{children}</div>),
}));

vi.mock('../use-chat-session', () => ({
  isNlqMessage: vi.fn(),
  isTextMessage: vi.fn(),
}));

const isNlqMessage = isNlqMessageOriginal as unknown as Mock<typeof isNlqMessageOriginal>;
const isTextMessage = isTextMessageOriginal as unknown as Mock<typeof isTextMessageOriginal>;

const textMessage = { answer: 'Hello world!' };
const textResponse: ChatMessage = { content: JSON.stringify(textMessage), role: 'assistant' };
const nlqUserMsgResponse: ChatMessage = {
  content: JSON.stringify({ userMsg: 'Hello, user!', clarification: '' }),
  role: 'assistant',
};
const nlqResponse: ChatMessage = {
  content: JSON.stringify({
    userMsg: '',
    clarification: '',
    nlqPrompt: 'something',
    mockedText: 'mockedNlqText',
  }),
  role: 'assistant',
};

describe('MessageResolver', () => {
  it('renders TextMessage with userMsg when message is an NLQ message with userMsg', () => {
    isNlqMessage.mockReturnValue(true);

    const { getByText } = render(<MessageResolver message={nlqUserMsgResponse} />);

    expect(getByText('Hello, user!')).toBeInTheDocument();
  });

  it('renders NlqMessageGroup when message is an NLQ message without userMsg', () => {
    isNlqMessage.mockReturnValue(true);

    const { getByText } = render(<MessageResolver message={nlqResponse} />);

    expect(getByText('mockedNlqText')).toBeInTheDocument();
  });

  it('renders TextMessage with content when message is a text answer', () => {
    isNlqMessage.mockReturnValue(false);
    isTextMessage.mockReturnValue(true);

    const { getByText } = render(<MessageResolver message={textResponse} />);

    expect(getByText(textMessage.answer)).toBeInTheDocument();
  });

  it('aligns TextMessage to the right when message role is user', () => {
    isNlqMessage.mockReturnValue(false);
    isTextMessage.mockReturnValue(true);
    const message: ChatMessage = { content: JSON.stringify(textMessage), role: 'user' };

    const { getByTestId } = render(<MessageResolver message={message} />);

    expect(getByTestId('right')).toBeInTheDocument();
  });

  it('aligns TextMessage to the left when message role is not user', () => {
    const message: ChatMessage = { content: JSON.stringify(textMessage), role: 'assistant' };

    const { getByTestId } = render(<MessageResolver message={message} />);

    expect(getByTestId('left')).toBeInTheDocument();
  });
});
