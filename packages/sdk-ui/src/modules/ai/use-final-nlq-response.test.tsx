/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, Mock } from 'vitest';

import { useGetChat as originalUseGetChat } from '@/modules/ai/use-get-chat';

import { useChatHistory as originalUseChatHistory } from './api/chat-history';
import { ChatMessage } from './api/types';
import { useFinalNlqResponse } from './use-final-nlq-response';

vi.mock('./api/chat-history', () => ({
  useChatHistory: vi.fn(),
}));

vi.mock('./use-get-chat', () => ({
  useGetChat: vi.fn(),
}));

const useChatHistory = originalUseChatHistory as unknown as Mock<typeof originalUseChatHistory>;
const useGetChat = originalUseGetChat as unknown as Mock<typeof originalUseGetChat>;
useGetChat.mockReturnValue({ chatId: '1', isLoading: false, isError: false });

describe('useFinalNlqResponse', () => {
  const responseData = {
    clarification: '',
    userMsg: '',
    detailedDescription: '',
    followupQuestions: [],
    nlqPrompt: '',
  };

  const response: ChatMessage = { content: JSON.stringify(responseData), role: 'assistant' };

  const testWithHistory = (chatHistory: ChatMessage[] | undefined) => {
    useChatHistory.mockReturnValue({
      history: chatHistory,
      isLoading: false,
      isError: false,
    });
    const { result } = renderHook(() => useFinalNlqResponse({ contextTitle: 'mocked' }));
    return result.current;
  };

  it('should return null if chatHistory is undefined', () => {
    expect(testWithHistory(undefined)).toBeNull();
  });

  it('should return null if chatHistory is empty', () => {
    expect(testWithHistory([])).toBeNull();
  });

  it('should return null if there is no NLQ responses in the history', () => {
    const chatHistory: ChatMessage[] = [{ ...response }, { ...response }, { ...response }];
    expect(testWithHistory(chatHistory)).toBeNull();
  });

  it('should return the final NLQ response from history if it exists', () => {
    const nlqResponse: ChatMessage = {
      content: JSON.stringify({ ...responseData, nlqPrompt: 'show chart' }),
      role: 'assistant',
      type: 'nlq',
    };
    const anotherNlqResponse: ChatMessage = {
      content: JSON.stringify({ ...responseData, nlqPrompt: 'show another chart' }),
      role: 'assistant',
      type: 'nlq',
    };

    const expectTest = (chatHistory: ChatMessage[], expectedPrompt: string) => {
      expect(testWithHistory(chatHistory)?.nlqPrompt).toBe(expectedPrompt);
    };

    expectTest([nlqResponse, response], 'show chart');
    expectTest([nlqResponse, anotherNlqResponse, response], 'show another chart');
    expectTest([nlqResponse, response, anotherNlqResponse], 'show another chart');
    expectTest([response, anotherNlqResponse, nlqResponse], 'show chart');
  });
});
