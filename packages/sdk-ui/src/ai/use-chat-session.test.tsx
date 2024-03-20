import { renderHook, waitFor } from '@testing-library/react';
import { Chat } from './api/types';
import { useChatSession } from './use-chat-session';
import { AiTestWrapper } from './__mocks__';
import { dataModels, perspectives } from './__mocks__/data';
import { http, HttpResponse } from 'msw';
import { server } from '@/__mocks__/msw';

const renderHookWithWrapper = (contextTitle: string) => {
  return renderHook(() => useChatSession(contextTitle), { wrapper: AiTestWrapper });
};

interface Cache {
  chats: Chat[];
}

const cache: Cache = {
  chats: [],
};

const partialMockChat: Omit<Chat, 'chatId' | 'contextId' | 'contextTitle' | 'contextType'> = {
  chatHistory: [],
  lastUpdate: '2021-01-01T00:00:00Z',
  tenantId: 't1',
  userId: 'u1',
};

const setupMockDataTopicsApi = () => {
  server.use(
    http.get('*/api/v2/datamodels/schema', () => HttpResponse.json(dataModels)),
    http.get('*/api/v2/perspectives', () => HttpResponse.json(perspectives)),
  );
};

const setupMockChatApi = () => {
  server.use(
    http.post<object, { contextId: string }, Chat, string>('*/api/v2/ai/chats', async (req) => {
      const { contextId } = await req.request.json();
      const model = [...dataModels, ...perspectives].find((d) => contextId === d.oid);
      if (!model) {
        throw Error('Data model or perspective not found');
      }

      const newChat: Chat = {
        chatId: 'new-chat',
        chatHistory: [],
        contextId,
        contextTitle: 'title' in model ? model.title : model.name,
        contextType: 'title' in model ? 'datamodel' : 'perspective',
        lastUpdate: '2021-01-01T00:00:00Z',
        tenantId: 't1',
        userId: 'u1',
      };
      cache.chats = [newChat, ...cache.chats];

      return HttpResponse.json(newChat);
    }),
    http.get('*/api/v2/ai/chats', () => HttpResponse.json(cache.chats)),
    http.get('*/api/v2/ai/chats/:id', (req) => {
      const chat = cache.chats.find((c) => c.chatId === req.params.id);

      return HttpResponse.json(chat);
    }),
  );
};

describe('useChatSession', () => {
  beforeEach(() => {
    setupMockDataTopicsApi();
    setupMockChatApi();

    cache.chats = [];
  });

  describe('when target context is found', () => {
    it('creates a new chat when no chat exists for the target context', async () => {
      const { result } = renderHookWithWrapper('Model 2');

      await waitFor(() => expect(result.current.chatId).toBe('new-chat'));
    });

    it('returns existing chat session when a chat exists for the target context', async () => {
      cache.chats = [
        {
          ...partialMockChat,
          chatId: 'existing-chat',
          contextId: 'm2',
          contextTitle: 'Model 2',
          contextType: 'datamodel',
        },
      ];

      const { result } = renderHookWithWrapper('Model 2');

      await waitFor(() => expect(result.current.chatId).toBe('existing-chat'));
    });
  });

  it('does not create a chat if target context is not found', async () => {
    const { result } = renderHookWithWrapper('Model that does not exist');

    await waitFor(() => expect(result.current.chatId).toBeUndefined());

    expect(cache.chats).toHaveLength(0);
  });
});
