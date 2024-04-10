import { setup } from '@/__test-helpers__';
import { screen } from '@testing-library/react';
import ChatInput from './chat-input';
import AiContextProvider from './ai-context-provider';

const onSendMessageMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('when user has typed non-empty input text', () => {
  it('calls onSendMessage when clicking send button', async () => {
    const { user } = setup(<ChatInput onSendMessage={onSendMessageMock} />);

    await user.type(screen.getByRole('textbox'), 'hello :)');
    await user.click(screen.getByLabelText('send chat message'));

    expect(onSendMessageMock).toHaveBeenCalledOnce();
    expect(onSendMessageMock).toHaveBeenCalledWith('hello :)');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('calls onSendMessage when pressing Enter', async () => {
    const { user } = setup(<ChatInput onSendMessage={onSendMessageMock} />);

    await user.type(screen.getByRole('textbox'), 'hello :)');
    await user.keyboard('{Enter}');

    expect(onSendMessageMock).toHaveBeenCalledOnce();
    expect(onSendMessageMock).toHaveBeenCalledWith('hello :)');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});

describe('when user has not typed any input text', () => {
  it('input has a default placeholder', () => {
    setup(<ChatInput onSendMessage={onSendMessageMock} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Ask a question');
  });

  it('input has a customized placeholder', () => {
    const alternativePlaceholderText = 'Some other placeholder';
    setup(
      <AiContextProvider config={{ inputPromptText: alternativePlaceholderText }}>
        <ChatInput onSendMessage={onSendMessageMock} />
      </AiContextProvider>,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', alternativePlaceholderText);
  });

  it('input does not call onSendMessage', async () => {
    const { user } = setup(<ChatInput onSendMessage={onSendMessageMock} />);

    await user.click(screen.getByLabelText('send chat message'));

    expect(onSendMessageMock).not.toHaveBeenCalled();
  });
});

describe('when user has typed whitespace as input text', () => {
  it('input does not call onSendMessage', async () => {
    const { user } = setup(<ChatInput onSendMessage={onSendMessageMock} />);

    await user.type(screen.getByRole('textbox'), '    \n');
    await user.click(screen.getByLabelText('send chat message'));

    expect(onSendMessageMock).not.toHaveBeenCalled();
  });
});

it('setting disabled=true disables send chat button', async () => {
  const { user } = setup(<ChatInput onSendMessage={onSendMessageMock} disabled />);

  expect(screen.getByLabelText('send chat message')).toBeDisabled();

  await user.click(screen.getByLabelText('send chat message'));

  expect(onSendMessageMock).not.toHaveBeenCalled();
});
