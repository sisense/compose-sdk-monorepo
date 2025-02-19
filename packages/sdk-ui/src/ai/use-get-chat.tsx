import { useGetAllChats, useMaybeCreateChat } from '@/ai/api/hooks';
import { useChatIdStorage } from '@/ai/chat-id-storage-provider';
import { useEffect } from 'react';
import { ChatContextDetails } from '@/ai/api/types';

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
