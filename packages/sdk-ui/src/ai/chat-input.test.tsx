import { setup } from '@/__test-helpers__';
import { screen } from '@testing-library/react';
import ChatInput, { ChatInputProps } from './chat-input';
import AiContextProvider from './ai-context-provider';

const onSendMessageMock = vi.fn();

const chatInputProps: ChatInputProps = {
  recentPrompts: ['first recent', 'second recent'],
  suggestions: ['first suggestion', 'second suggestion'],
  isLoading: false,
  onSendMessage: onSendMessageMock,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('when user has typed non-empty input text', () => {
  it('calls onSendMessage when clicking send button', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} />);

    await user.type(screen.getByRole('textbox'), 'hello :)');
    await user.click(screen.getByLabelText('send chat message'));

    expect(onSendMessageMock).toHaveBeenCalledOnce();
    expect(onSendMessageMock).toHaveBeenCalledWith('hello :)');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('calls onSendMessage when pressing Enter', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} onSendMessage={onSendMessageMock} />);

    await user.type(screen.getByRole('textbox'), 'hello :)');
    await user.keyboard('{Enter}');

    expect(onSendMessageMock).toHaveBeenCalledOnce();
    expect(onSendMessageMock).toHaveBeenCalledWith('hello :)');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});

describe('when user has not typed any input text', () => {
  it('input has a default placeholder', () => {
    setup(<ChatInput {...chatInputProps} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Ask a question');
  });

  it('input has a customized placeholder', () => {
    const alternativePlaceholderText = 'Some other placeholder';
    setup(
      <AiContextProvider config={{ inputPromptText: alternativePlaceholderText }}>
        <ChatInput {...chatInputProps} />
      </AiContextProvider>,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', alternativePlaceholderText);
  });

  it('input does not call onSendMessage', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} />);

    await user.click(screen.getByLabelText('send chat message'));

    expect(onSendMessageMock).not.toHaveBeenCalled();
  });
});

describe('when user has typed whitespace as input text', () => {
  it('input does not call onSendMessage', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} />);

    await user.type(screen.getByRole('textbox'), '    \n');
    await user.click(screen.getByLabelText('send chat message'));

    expect(onSendMessageMock).not.toHaveBeenCalled();
  });
});

it('setting disabled=true disables send chat button', async () => {
  const { user } = setup(<ChatInput {...chatInputProps} disabled />);

  expect(screen.getByLabelText('send chat message')).toBeDisabled();

  await user.click(screen.getByLabelText('send chat message'));

  expect(onSendMessageMock).not.toHaveBeenCalled();
});

describe('when user types text starting with /', () => {
  it('shows the dropup, allows sections to expand when clicked', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} />);

    await user.type(screen.getByRole('textbox'), '/');

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('/RECENT')).toBeInTheDocument();
    expect(screen.getByText('/AI SUGGESTIONS')).toBeInTheDocument();

    await user.click(screen.getByText('/RECENT'));
    expect(screen.getByText('first recent')).toBeInTheDocument();

    await user.click(screen.getByText('/AI SUGGESTIONS'));
    expect(screen.getByText('first suggestion')).toBeInTheDocument();
  });

  it('can filter on recent and expands section by default', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} />);

    await user.type(screen.getByRole('textbox'), '/r');

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('/RECENT')).toBeInTheDocument();
    expect(screen.queryByText('/AI SUGGESTIONS')).toBeNull();
    expect(screen.getByText('first recent')).toBeInTheDocument();
  });

  it('can filter on ai suggestions and expands section by default', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} />);

    await user.type(screen.getByRole('textbox'), '/a');

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.queryByText('/RECENT')).toBeNull();
    expect(screen.getByText('/AI SUGGESTIONS')).toBeInTheDocument();
    expect(screen.getByText('first suggestion')).toBeInTheDocument();
  });

  it('executes callback when question is selected', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} />);

    await user.type(screen.getByRole('textbox'), '/ai');
    await user.click(screen.getByText('/AI SUGGESTIONS'));
    await user.click(screen.getByText('first suggestion'));

    expect(onSendMessageMock).toHaveBeenCalledOnce();
  });

  it('hides the dropup if no section matches', async () => {
    const { user } = setup(<ChatInput {...chatInputProps} />);

    await user.type(screen.getByRole('textbox'), '/notasection');

    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(screen.queryByText('/RECENT')).toBeNull();
    expect(screen.queryByText('/AI SUGGESTIONS')).toBeNull();
  });
});
