import { renderHook, waitFor } from '@testing-library/react';
import { Chat, ChatMessage } from './api/types';
import { isNlqMessage, isTextMessage, useChatSession } from './use-chat-session';
import { AiTestWrapper } from './__mocks__';
import { contexts } from './__mocks__/data';
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
  server.use(http.get('*/api/datasources', () => HttpResponse.json(contexts)));
};

const setupMockChatApi = () => {
  server.use(
    http.post<object, { sourceId: string }, Chat, string>('*/api/v2/ai/chats', async (req) => {
      const { sourceId } = await req.request.json();
      const model = [...contexts].find((d) => sourceId === d.title);
      if (!model) {
        throw Error('Data model or perspective not found');
      }

      const newChat: Chat = {
        chatId: 'new-chat',
        chatHistory: [],
        contextId: sourceId,
        contextTitle: model.title,
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

  it('should check message type of chat message', () => {
    const textMessage: ChatMessage = {
      type: 'text',
      content: 'Hello',
      role: 'assistant',
    };
    const nlqMessage: ChatMessage = {
      type: 'nlq',
      content: '{"data": "something"}',
      role: 'assistant',
    };

    expect(isNlqMessage(nlqMessage)).toBeTruthy();
    expect(isTextMessage(textMessage)).toBeTruthy();
    expect(isNlqMessage(textMessage)).toBeFalsy();
    expect(isTextMessage(nlqMessage)).toBeFalsy();
  });
});
