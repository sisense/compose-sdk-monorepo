import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useGetDataTopics } from './api/hooks';
import ChatBox from './chat-box';
import { useChatConfig } from './chat-config';
import ChatHome from './chat-home';
import ErrorContainer from './common/error-container';
import LoadingSpinner from '../common/components/loading-spinner';

export default function ChatRouter() {
  const [validDataTopicsList, setValidDataTopicsList] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const { data, fetchStatus } = useGetDataTopics();

  const { dataTopicsList = [] } = useChatConfig();

  useEffect(() => {
    if (data && fetchStatus === 'idle') {
      let allowedContexts = data;
      if (dataTopicsList && dataTopicsList.length) {
        allowedContexts = data?.filter((dataTopic) => dataTopicsList?.includes(dataTopic.title));
      }
      setValidDataTopicsList(allowedContexts.map((dataTopic) => dataTopic.title));
      if (!allowedContexts.length) {
        setErrorMessage(`None of the provided data models or perspectives are available`);
      } else if (allowedContexts.length === 1) {
        setErrorMessage(undefined);
        setSelectedContext(allowedContexts[0].title);
      }
    }
  }, [data, dataTopicsList, fetchStatus]);

  const queryClient = useQueryClient();
  const handleRefresh = useCallback(() => {
    setErrorMessage(undefined);
    queryClient.invalidateQueries(['getDataTopics']);
  }, [queryClient]);

  if (errorMessage) {
    return (
      <ErrorContainer text={errorMessage} action={{ text: 'Refresh', onClick: handleRefresh }} />
    );
  }

  if (validDataTopicsList.length === 1 && !selectedContext) {
    return <LoadingSpinner />;
  }

  return selectedContext ? (
    <>
      <ChatBox
        contextTitle={selectedContext}
        onGoBack={
          validDataTopicsList.length === 1 ? undefined : () => setSelectedContext(undefined)
        }
      />
    </>
  ) : (
    <ChatHome
      dataTopicsList={validDataTopicsList}
      onDataTopicClick={(title) => setSelectedContext(title)}
    />
  );
}
