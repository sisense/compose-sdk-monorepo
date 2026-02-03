/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, Mock } from 'vitest';

import { ChatMessage } from './api/types.js';
import { isNlqMessage as isNlqMessageOriginal } from './use-chat-session.js';
import { useLastNlqResponseFromHistory } from './use-last-nlq-response-from-history.js';

vi.mock('./use-chat-session', () => ({
  isNlqMessage: vi.fn(),
}));

const isNlqMessage = isNlqMessageOriginal as unknown as Mock<typeof isNlqMessageOriginal>;

describe('useLastNlqResponseFromHistory', () => {
  const nlqResponseData = {
    userMsg: '',
    clarification: '',
    detailedDescription: '',
    followupQuestions: [],
    nlqPrompt: '',
  };

  const nlqResponse: ChatMessage = { content: JSON.stringify(nlqResponseData), role: 'assistant' };

  it('should return null if chatHistory is undefined', () => {
    const { result } = renderHook(() => useLastNlqResponseFromHistory());
    expect(result.current).toBeNull();
  });

  it('should return null if chatHistory is empty', () => {
    const { result } = renderHook(() => useLastNlqResponseFromHistory([]));
    expect(result.current).toBeNull();
  });

  it('should return null if the last message is not an NLQ message', () => {
    isNlqMessage.mockReturnValue(false);
    const chatHistory: ChatMessage[] = [nlqResponse];
    const { result } = renderHook(() => useLastNlqResponseFromHistory(chatHistory));
    expect(result.current).toBeNull();
  });

  it('should return the last NLQ response if the last message is an NLQ message', () => {
    isNlqMessage.mockReturnValue(true);
    const chatHistory: ChatMessage[] = [nlqResponse];
    const { result } = renderHook(() => useLastNlqResponseFromHistory(chatHistory));
    expect(result.current).toEqual(nlqResponseData);
  });
});
