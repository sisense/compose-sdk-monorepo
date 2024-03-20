import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import ChatRouter from './chat-router';
import { AiTestWrapper } from './__mocks__';
import { dataModels, perspectives } from './__mocks__/data';
import { ChatConfigProvider } from './chat-config';
import { Chat, DataModel } from './api/types';

const setupMockDataTopicsApi = (models: DataModel[]) => {
  server.use(
    http.get('*/api/v2/datamodels/schema', () => HttpResponse.json(models)),
    http.get('*/api/v2/perspectives', () => HttpResponse.json(perspectives)),
  );
};

const setupMockChatsApi = (chatResponse: Chat) => {
  server.use(
    http.get('*/api/v2/ai/chats', () => HttpResponse.json([chatResponse])),
    http.get('*/api/v2/ai/chats/:chatId', () => HttpResponse.json(chatResponse)),
  );
};
const setupMockQueryRecsApi = () => {
  server.use(
    http.get('*/api/v2/ai/recommendations/query/:title/:num', () => HttpResponse.json([])),
  );
};

describe('ChatRouter', () => {
  const mockChat: Chat = {
    chatId: 'mock-chat',
    chatHistory: [],
    contextId: 'm2',
    contextTitle: 'Model 2',
    contextType: 'datamodel',
    lastUpdate: '2021-01-01T00:00:00Z',
    tenantId: 't1',
    userId: 'u1',
  };

  beforeEach(() => {
    setupMockDataTopicsApi(dataModels);
    setupMockChatsApi(mockChat);
    setupMockQueryRecsApi();
  });

  describe('when no default context title is present', () => {
    it('renders the data topics screen and allows navigation to and from the chat box', async () => {
      const { user } = setup(
        <AiTestWrapper>
          <ChatRouter />
        </AiTestWrapper>,
      );

      await waitFor(() => expect(screen.getByText('Data Topics')).toBeInTheDocument());
      expect(screen.getByText('Model 1')).toBeInTheDocument();
      expect(screen.getByText('Model 2')).toBeInTheDocument();
      expect(screen.getByText('Model 3')).toBeInTheDocument();

      expect(screen.queryByPlaceholderText('Ask a question')).toBeNull();

      // Click on a data topic
      await user.click(screen.getByText('Model 2'));

      // Verify that input is shown
      expect(screen.getByPlaceholderText('Ask a question')).toBeInTheDocument();

      // Click to navigate back to the data topics screen
      await user.click(screen.getByLabelText('go back'));

      expect(screen.getByText('Data Topics')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Ask a question')).toBeNull();
    });
  });

  describe('when a default context title is set', () => {
    it('skips the data topics screen', async () => {
      setup(
        <AiTestWrapper>
          <ChatConfigProvider value={{ defaultContextTitle: 'Model 2' }}>
            <ChatRouter />
          </ChatConfigProvider>
        </AiTestWrapper>,
      );

      await waitFor(() => expect(screen.getByText('Model 2')).toBeInTheDocument());
      expect(screen.getByPlaceholderText('Ask a question')).toBeInTheDocument();
      expect(screen.queryByLabelText('go back')).toBeNull();
    });
  });

  describe('when no context is found for the context title', () => {
    it('renders the error screen and allows for refresh', async () => {
      const newModel: DataModel = {
        oid: 'new-model',
        title: 'New Model',
      };

      const { user } = setup(
        <AiTestWrapper>
          <ChatConfigProvider value={{ defaultContextTitle: newModel.title }}>
            <ChatRouter />
          </ChatConfigProvider>
        </AiTestWrapper>,
      );

      await waitFor(() =>
        expect(
          screen.getByText(`Data model or perspective "${newModel.title}" not found`),
        ).toBeInTheDocument(),
      );

      expect(screen.queryByPlaceholderText('Ask a question')).toBeNull();

      // Override APIs to return the new model
      setupMockDataTopicsApi([newModel]);
      setupMockChatsApi({ ...mockChat, contextId: newModel.oid, contextTitle: newModel.title });

      // Click refresh
      await user.click(screen.getByText('Refresh'));

      expect(screen.queryByText(/Data model or perspective ".*" not found/)).toBeNull();
      expect(screen.getByText(newModel.title)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ask a question')).toBeInTheDocument();
      expect(screen.queryByLabelText('go back')).toBeNull();
    });
  });
});
