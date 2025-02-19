import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useMemo } from 'react';
import { useGetDataTopics } from './api/hooks';
import ChatBox from './chat-box';
import { useChatConfig } from './chat-config';
import ChatHome from './chat-home';
import ErrorContainer from './common/error-container';
import LoadingSpinner from '../common/components/loading-spinner';
import { useTranslation } from 'react-i18next';

export default function ChatRouter() {
  const [selectedContext, setSelectedContext] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const { data, fetchStatus } = useGetDataTopics();

  const { dataTopicsList, contextDetails } = useChatConfig();
  const { t } = useTranslation();
  const noAvailableDataTopicsErrorMessage = t('ai.errors.noAvailableDataTopics');

  const onContextsLoaded = useCallback(
    (validDataTopicsList: string[]) => {
      if (!validDataTopicsList.length) {
        setErrorMessage(noAvailableDataTopicsErrorMessage);
      } else if (validDataTopicsList.length === 1) {
        setErrorMessage(undefined);
        setSelectedContext(validDataTopicsList[0]);
      }
    },
    [noAvailableDataTopicsErrorMessage],
  );

  const validDataTopicsList = useMemo(() => {
    if (data && fetchStatus === 'idle') {
      const allowedContexts = dataTopicsList?.length
        ? data?.filter((dataTopic) => dataTopicsList?.includes(dataTopic.title))
        : data;
      const validDataTopicsList = allowedContexts.map((dataTopic) => dataTopic.title);

      onContextsLoaded(validDataTopicsList);

      return validDataTopicsList;
    }
    return [];
  }, [data, fetchStatus, dataTopicsList, onContextsLoaded]);

  const queryClient = useQueryClient();
  const handleRefresh = useCallback(() => {
    setErrorMessage(undefined);
    queryClient.invalidateQueries(['getDataTopics']);
  }, [queryClient]);

  if (errorMessage) {
    return (
      <ErrorContainer
        text={errorMessage}
        action={{ text: t('ai.buttons.refresh'), onClick: handleRefresh }}
      />
    );
  }

  if (validDataTopicsList.length === 1 && !selectedContext) {
    return <LoadingSpinner />;
  }

  return selectedContext ? (
    <ChatBox
      contextTitle={selectedContext}
      contextDetails={contextDetails}
      onGoBack={validDataTopicsList.length === 1 ? undefined : () => setSelectedContext(undefined)}
    />
  ) : (
    <ChatHome
      dataTopicsList={validDataTopicsList}
      onDataTopicClick={(title) => setSelectedContext(title)}
    />
  );
}
