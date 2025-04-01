import { Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLastNlqResponse } from './use-last-nlq-response';
import { useGetChat } from '@/ai/use-get-chat';
import { useChatHistory } from './api/chat-history';
import { useLastNlqResponseFromHistory } from '@/ai/use-last-nlq-response-from-history';

vi.mock('@/ai/use-get-chat');
vi.mock('./api/chat-history');
vi.mock('@/ai/use-last-nlq-response-from-history');

describe('useLastNlqResponse', () => {
  const mockChatId = 'mockChatId';
  const mockHistory = [{ id: '1', message: 'test message' }];
  const mockNlqResponse = { id: '1', response: 'test response' };

  beforeEach(() => {
    (useGetChat as Mock).mockReturnValue({ chatId: mockChatId });
    (useChatHistory as Mock).mockReturnValue({ history: mockHistory });
    (useLastNlqResponseFromHistory as Mock).mockReturnValue(mockNlqResponse);
  });

  it('should return the last NLQ response from the chat history', () => {
    const { result } = renderHook(() => useLastNlqResponse({ contextTitle: 'testTitle' }));

    expect(result.current).toEqual(mockNlqResponse);
  });

  it('should handle empty chat history', () => {
    (useChatHistory as Mock).mockReturnValue({ history: [] });
    (useLastNlqResponseFromHistory as Mock).mockReturnValue(null);

    const { result } = renderHook(() => useLastNlqResponse({ contextTitle: 'testTitle' }));

    expect(result.current).toBeNull();
  });
});
