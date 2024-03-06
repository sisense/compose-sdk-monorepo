import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Chat, ChatResponse, QueryRecommendation } from './api/types';
import ChatBox from './chat-box';
import { MockApiWrapper } from './__mocks__';
import { chat, dataModels, perspectives } from './__mocks__/data';

beforeEach(() => {
  server.use(
    http.get('*/api/v2/datamodels/schema', () => HttpResponse.json(dataModels)),
    http.get('*/api/v2/perspectives', () => HttpResponse.json(perspectives)),
    http.get('*/api/v2/ai/chats', () => HttpResponse.json([chat])),
    http.get('*/api/v2/ai/chats/:chatId', () =>
      HttpResponse.json<Chat>({
        ...chat,
        chatHistory: [
          {
            content: 'response text from history',
            role: 'assistant',
            type: 'Text',
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
        responseType: 'Text',
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
    <MockApiWrapper>
      <ChatBox contextTitle="Model 2" />
    </MockApiWrapper>,
  );

  await waitFor(() => expect(screen.getByText('response text from history')).toBeInTheDocument());

  const suggestionList = screen.getByLabelText('list of suggested questions');

  expect(within(suggestionList).getByText('What is the total revenue?')).toBeInTheDocument();
  expect(within(suggestionList).getByText('How many brands are there?')).toBeInTheDocument();
});

it('can render a text response after sending a message', async () => {
  const { user } = setup(
    <MockApiWrapper>
      <ChatBox contextTitle="Model 2" />
    </MockApiWrapper>,
  );

  await waitFor(() => expect(screen.getByText('response text from history')).toBeInTheDocument());

  const input = screen.getByPlaceholderText('Ask a question');
  await user.type(input, 'question text');

  expect(input).toHaveValue('question text');

  const sendButton = screen.getByLabelText('send chat message');
  await user.click(sendButton);

  expect(screen.getByText('new response text')).toBeInTheDocument();
});

it('can render clickable buttons for clearing history', async () => {
  server.use(http.delete('*/api/v2/ai/chats/:chatId/history', () => new HttpResponse()));

  const { user } = setup(
    <MockApiWrapper>
      <ChatBox contextTitle="Model 2" />
    </MockApiWrapper>,
  );

  await waitFor(() => expect(screen.getByText('response text from history')).toBeInTheDocument());

  await user.click(screen.getByLabelText('clear history'));
  expect(screen.getByText('Yes, clear chat')).toBeInTheDocument();
  expect(screen.getByText('No, continue analysis')).toBeInTheDocument();

  await user.click(screen.getByText('No, continue analysis'));
  expect(screen.queryByText('Yes, clear chat')).toBeNull();
  expect(screen.queryByText('No, continue analysis')).toBeNull();

  await user.click(screen.getByLabelText('clear history'));
  await user.click(screen.getByText('Yes, clear chat'));

  expect(screen.queryByText('Yes, clear chat')).toBeNull();
  expect(screen.queryByText('No, continue analysis')).toBeNull();

  expect(
    screen.getByText("Let's start over. Try asking questions about your dataset."),
  ).toBeInTheDocument();
});
