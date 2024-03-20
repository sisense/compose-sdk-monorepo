import { useChatApi } from '../api/chat-api-provider';
import { useQuery } from '@tanstack/react-query';

/**
 * Gets the fields of a data source.
 *
 * Alternative hook implementation of QueryApiDispatcher.getDataSourceFields
 *
 * @param dataSource - The data source to get the fields for
 * @internal
 */
export const useGetDataSource = (dataSource: string | undefined) => {
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
