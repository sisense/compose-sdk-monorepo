import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Chat, ChatContextDetails, ChatMessage } from './api/types';
import { isNlqMessage, isTextMessage, useChatSession } from './use-chat-session';
import { AiTestWrapper } from './__mocks__';
import { contexts } from './__mocks__/data';
import { http, HttpResponse } from 'msw';
import { server } from '@/__mocks__/msw';

const getWrapper =
  (volatile = false) =>
  ({ children }: { children: ReactNode }) =>
    <AiTestWrapper volatile={volatile}>{children}</AiTestWrapper>;

const renderHookWithWrapper = (
  contextTitle: string,
  volatile?: boolean,
  contextDetails?: ChatContextDetails,
) => {
  return renderHook(() => useChatSession(contextTitle, contextDetails), {
    wrapper: getWrapper(volatile),
  });
};

type ServerChat = Chat & { volatile?: boolean };

interface Cache {
  chats: ServerChat[];
}

const cache: Cache = {
  chats: [],
};

const partialMockChat: Omit<ServerChat, 'chatId' | 'contextId' | 'contextTitle' | 'contextType'> = {
  chatHistory: [],
  expireAt: '2021-01-01T00:00:00Z',
  tenantId: 't1',
  userId: 'u1',
};

const setupMockDataTopicsApi = () => {
  server.use(http.get('*/api/datasources', () => HttpResponse.json(contexts)));
};

const setupMockChatApi = () => {
  server.use(
    http.post<
      object,
      {
        sourceId: string;
        contextDetails?: ChatContextDetails;
        volatile?: boolean;
      },
      Chat,
      string
    >('*/api/v2/ai/chats', async (req) => {
      const { sourceId, contextDetails, volatile } = await req.request.json();
      const model = [...contexts].find((d) => sourceId === d.title);
      if (!model) {
        throw Error('Data model or perspective not found');
      }

      const newChat: ServerChat = {
        chatId: 'new-chat',
        chatHistory: [],
        contextId: sourceId,
        contextTitle: model.title,
        contextDetails: contextDetails,
        expireAt: '2021-01-01T00:00:00Z',
        tenantId: 't1',
        userId: 'u1',
        volatile,
      };
      cache.chats = [newChat, ...cache.chats];

      return HttpResponse.json(newChat);
    }),
    http.get('*/api/v2/ai/chats', () => HttpResponse.json(cache.chats.filter((c) => !c.volatile))),
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
        {
          ...partialMockChat,
          chatId: 'existing-chat-volatile',
          contextId: 'm3',
          contextTitle: 'Model 3',
          volatile: true,
        },
        {
          ...partialMockChat,
          chatId: 'existing-chat-with-context',
          contextId: 'm2',
          contextTitle: 'Model 2',
          contextDetails: {
            dashboardId: 'dashboard-1',
          },
        },
      ];

      const { result } = renderHookWithWrapper('Model 2');
      await waitFor(() => expect(result.current.chatId).toBe('existing-chat'));

      const { result: result2 } = renderHookWithWrapper('Model 3');
      await waitFor(() => expect(result2.current.chatId).toBe('new-chat'));

      const { result: result3 } = renderHookWithWrapper('Model 2', false, {
        dashboardId: 'dashboard-1',
      });
      await waitFor(() => expect(result3.current.chatId).toBe('existing-chat-with-context'));
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
