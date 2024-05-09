import { useQuery } from '@tanstack/react-query';
import { useChatApi } from './api/chat-api-provider.js';

/**
 * Gets the fields of a data source. This is needed by Analytics Composer.
 *
 * Alternative hook implementation of QueryApiDispatcher.getDataSourceFields
 *
 * @param dataSource - The data source to get the fields for
 * @internal
 */
export const useGetDataSourceFields = (dataSource: string | undefined) => {
  const api = useChatApi();

  const { data, isLoading } = useQuery({
    queryKey: ['getDataSourceFields', dataSource, api],
    queryFn: () => (dataSource ? api?.ai.getDataSourceFields(dataSource) : undefined),
    select: (data) => data,
    enabled: !!api && !!dataSource,
  });

  return {
    data,
    isLoading,
  };
};
