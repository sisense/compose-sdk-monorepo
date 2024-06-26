import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useGetDataTopics } from './api/hooks';
import ChatBox from './chat-box';
import { useChatConfig } from './chat-config';
import ChatHome from './chat-home';
import ErrorContainer from './common/error-container';
import LoadingSpinner from '../common/components/loading-spinner';

export default function ChatRouter() {
  const [selectedContext, setSelectedContext] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const { data, fetchStatus } = useGetDataTopics();

  const { defaultContextTitle } = useChatConfig();

  useEffect(() => {
    if (defaultContextTitle && data && fetchStatus === 'idle') {
      const target = data.find((c) => c.title === defaultContextTitle);
      if (target) {
        setErrorMessage(undefined);
        setSelectedContext(target.title);
      } else {
        setErrorMessage(`Data model or perspective "${defaultContextTitle}" not found`);
      }
    }
  }, [data, defaultContextTitle, fetchStatus]);

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

  if (defaultContextTitle && !selectedContext) {
    return <LoadingSpinner />;
  }

  return selectedContext ? (
    <ChatBox
      contextTitle={selectedContext}
      onGoBack={defaultContextTitle ? undefined : () => setSelectedContext(undefined)}
    />
  ) : (
    <ChatHome onDataTopicClick={(title) => setSelectedContext(title)} />
  );
}
