import { Chat, ChatContext } from '../api/types.js';

export const contexts: ChatContext[] = [
  {
    title: 'Model 1',
    live: false,
  },
  {
    title: 'Model 2',
    live: false,
  },
  {
    title: 'Model 3',
    live: false,
  },
];

export const chat: Chat = {
  chatId: 'c2',
  chatHistory: [],
  contextId: 'm2',
  contextTitle: 'Model 2',
  expireAt: '2021-01-01T00:00:00Z',
  tenantId: 't1',
  userId: 'u1',
};
