import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/__mocks__/msw';

import { AiTestWrapper } from '../__mocks__/index.js';
import { useChatHistory } from './chat-history.js';
import { Chat } from './types.js';

const renderHookWithWrapper = (chatId: string) => {
  return renderHook(() => useChatHistory(chatId), { wrapper: AiTestWrapper });
};

describe('useChatHistory', () => {
  beforeEach(() => {
    server.use(
      http.get('*/api/v2/ai/chats/:chatId', () =>
        HttpResponse.json<Chat>({
          chatId: 'mock-chat',
          chatHistory: [{ content: 'hello', role: 'user' }],
          contextId: 'm2',
          contextTitle: 'Model 2',
          expireAt: '2021-01-01T00:00:00Z',
          tenantId: 't1',
          userId: 'u1',
        }),
      ),
    );
  });

  it('returns data when successful', async () => {
    const { result } = renderHookWithWrapper('mock-chat');

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.history).toEqual([{ content: 'hello', role: 'user' }]);
  });

  it('clears history and sets cached history to empty array when unsuccessful', async () => {
    server.use(
      http.get('*/api/v2/ai/chats/:chatId', () => HttpResponse.error()),
      http.delete('*/api/v2/ai/chats/:chatId/history', () => HttpResponse.json()),
    );

    const { result } = renderHookWithWrapper('mock-chat');

    await waitFor(() => expect(result.current.history).toEqual([]));
  });
});
