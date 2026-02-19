import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setTimeout } from 'timers/promises';

import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';

import { translation } from '../../infra/translation/resources/en';
import { AiTestWrapper } from './__mocks__';
import { chat, contexts } from './__mocks__/data';
import { Chat, ChatResponse, QueryRecommendation } from './api/types';
import ChatBox from './chat-box';

beforeEach(() => {
  server.use(
    http.get('*/api/datasources', () => HttpResponse.json(contexts)),
    http.get('*/api/v2/ai/chats', () => HttpResponse.json([chat])),
    http.get('*/api/v2/ai/chats/:chatId', () =>
      HttpResponse.json<Chat>({
        ...chat,
        chatHistory: [
          {
            content: 'response text from history',
            role: 'assistant',
          },
        ],
      }),
    ),
    http.get('*/api/v2/ai/recommendations/query/:title/:num', () => HttpResponse.json([])),
    http.post('*/api/v2/ai/chats/:chatId', () =>
      HttpResponse.json<ChatResponse>({
        chatHistory: [],
        chatId: 'c2',
        data: {
          answer: 'new response text',
        },
        responseType: 'text',
      }),
    ),
  );
});

it('can render initial suggested questions', async () => {
  server.use(
    http.get('*/api/v2/ai/recommendations/query/:title/:num', () =>
      HttpResponse.json<Partial<QueryRecommendation>[]>([
        {
          nlqPrompt: 'What is the total revenue?',
        },
        {
          nlqPrompt: 'How many brands are there?',
        },
      ]),
    ),
  );

  setup(
    <AiTestWrapper>
      <ChatBox contextTitle="Model 2" />
    </AiTestWrapper>,
  );
  await setTimeout(250);

  await waitFor(() => expect(screen.getByText('response text from history')).toBeInTheDocument());

  const suggestionList = screen.getByLabelText('list of suggested questions');

  expect(within(suggestionList).getByText('What is the total revenue?')).toBeInTheDocument();
  expect(within(suggestionList).getByText('How many brands are there?')).toBeInTheDocument();
});

it('can render a text response after sending a message', async () => {
  const { user } = setup(
    <AiTestWrapper>
      <ChatBox contextTitle="Model 2" />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByText('response text from history')).toBeInTheDocument());

  const input = screen.getByLabelText('chat input');
  await user.type(input, 'question text');

  expect(input).toHaveValue('question text');

  const sendButton = screen.getByLabelText('send chat message');
  await user.click(sendButton);

  expect(screen.getByText('new response text')).toBeInTheDocument();
});

it('can render clickable buttons for clearing history', async () => {
  server.use(http.delete('*/api/v2/ai/chats/:chatId/history', () => new HttpResponse()));

  const { user } = setup(
    <AiTestWrapper>
      <ChatBox contextTitle="Model 2" />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByText('response text from history')).toBeInTheDocument());

  await user.click(screen.getByLabelText('clear history'));
  expect(screen.getByLabelText('confirm clear chat')).toBeInTheDocument();
  expect(screen.getByLabelText('cancel clear chat')).toBeInTheDocument();

  await user.click(screen.getByLabelText('cancel clear chat'));
  expect(screen.queryByLabelText('confirm clear chat')).toBeNull();
  expect(screen.queryByLabelText('cancel clear chat')).toBeNull();

  await user.click(screen.getByLabelText('clear history'));
  await user.click(screen.getByLabelText('confirm clear chat'));

  expect(screen.queryByLabelText('confirm clear chat')).toBeNull();
  expect(screen.queryByLabelText('cancel clear chat')).toBeNull();

  await waitFor(() => expect(screen.queryByText('response text from history')).toBeNull());
});

it('renders the correct error message when fetching history fails', async () => {
  server.use(
    http.get('*/api/v2/ai/chats/:chatId', () => HttpResponse.error()),
    http.delete('*/api/v2/ai/chats/:chatId/history', () => HttpResponse.json()),
  );

  setup(
    <AiTestWrapper>
      <ChatBox contextTitle="Model 2" />
    </AiTestWrapper>,
  );

  await waitFor(() =>
    expect(screen.getByText(translation.ai.errors.fetchHistory)).toBeInTheDocument(),
  );
});

it('renders the error container when chat is unavailable', async () => {
  server.use(
    http.get('*/api/v2/ai/chats', () => HttpResponse.error()),
    http.post('*/api/v2/ai/chats', () => HttpResponse.error()),
  );

  setup(
    <AiTestWrapper>
      <ChatBox contextTitle="Model 2" />
    </AiTestWrapper>,
  );

  await waitFor(() =>
    expect(screen.getByText(translation.ai.errors.chatUnavailable)).toBeInTheDocument(),
  );

  // input should not be available
  expect(screen.queryByLabelText('chat input')).toBeNull();
});
