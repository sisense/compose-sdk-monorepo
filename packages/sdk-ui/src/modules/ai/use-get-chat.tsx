import { useEffect } from 'react';

import { useGetAllChats, useMaybeCreateChat } from '@/modules/ai/api/hooks';
import { ChatContextDetails } from '@/modules/ai/api/types';
import { useChatIdStorage } from '@/modules/ai/chat-id-storage-provider';

export const useGetChat = (
  contextTitle: string,
  contextDetails?: ChatContextDetails,
  createIfNotExist = false,
) => {
  const { data: chats, isLoading } = useGetAllChats();

  const chatIdStorage = useChatIdStorage();

  const chatId =
    chatIdStorage.getChatId(contextTitle, contextDetails) ||
    chats.find(
      (c) =>
        c.contextTitle === contextTitle &&
        c.contextDetails?.dashboardId === contextDetails?.dashboardId,
    )?.chatId;

  const { isError, data, isSuccess } = useMaybeCreateChat(
    contextTitle,
    createIfNotExist && !isLoading && !chatId,
    contextDetails,
  );

  useEffect(() => {
    if (isSuccess && data && !chatId) {
      chatIdStorage.saveChatId(data.chatId, contextTitle, contextDetails);
    }
  }, [data, isSuccess, contextTitle, contextDetails, chatId, chatIdStorage]);

  return { chatId, isLoading, isError };
};
